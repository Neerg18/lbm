/*
 NEERG v7 · sky.js
 The About page sky. logic.js loads this file (and sky.css) the first time someone opens About, then calls
 NeergSky.mount(section), .start() and .stop() as About opens and closes.
 The sun and the moon stand where they really are over South Florida at the visitor's time of day, and the
 moon shows its real phase. Sun and moon math: SunCalc, below.
*/
(function () {
'use strict';

/*! SunCalc 2.1.1 (https://github.com/mourner/suncalc), trimmed to the parts this scene uses.
 * Copyright (c) 2026, Volodymyr Agafonkin
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
const SunCalc = (function () {


// shortcuts for easier to read formulas
const {PI, sin, cos, tan, asin, atan2: atan, acos, sqrt, abs, round, floor} = Math;
const rad = PI / 180;

// date/time constants and conversions

const dayMs = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;
const earthRadius = 6378.14; // equatorial radius in km, for the Moon's topocentric parallax

function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * dayMs);
}
function toDays(date) {
    return date.valueOf() / dayMs - 0.5 + J1970 - J2000;
}

// ΔT = TT − UT in seconds (Espenak & Meeus polynomial fits, good ~1900–2150). The Meeus position
// series are defined in Terrestrial Time, but SunCalc's input Dates are UT — so the position math
// runs on days-since-J2000 shifted by deltaT, while sidereal time stays on UT. ~69 s today;
// negligible for the Sun (<0.001°), real for the Moon. d only needs ~month accuracy here (ΔT
// changes <1 s/yr), so the decimal year is derived arithmetically from d rather than from the Date.
function deltaT(d) {
    const y = 2000 + d / 365.2425;
    let t;
    if (y < 1920) { t = y - 1900; return -2.79 + t * (1.494119 + t * (-0.0598939 + t * (0.0061966 - t * 0.000197))); }
    if (y < 1941) { t = y - 1920; return 21.20 + t * (0.84493 + t * (-0.076100 + t * 0.0020936)); }
    if (y < 1961) { t = y - 1950; return 29.07 + t * (0.407 + t * (-1 / 233 + t / 2547)); }
    if (y < 1986) { t = y - 1975; return 45.45 + t * (1.067 + t * (-1 / 260 - t / 718)); }
    if (y < 2005) { t = y - 2000; return 63.86 + t * (0.3345 + t * (-0.060374 + t * (0.0017275 + t * (0.000651814 + t * 0.00002373599)))); }
    if (y < 2050) { t = y - 2000; return 62.92 + t * (0.32217 + t * 0.005589); }
    t = (y - 1820) / 100; return -20 + 32 * t * t - 0.5628 * (2150 - y);
}
function toDaysTT(d) {
    return d + deltaT(d) / 86400;
}

// general calculations for position

// north-based clockwise azimuth in degrees (0 = N, 90 = E, 180 = S, 270 = W)
function azimuth(H, phi, dec) {
    return (atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)) / rad + 540) % 360;
}
function altitude(H, phi, dec) {
    return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
}

// Greenwich mean sidereal time, formula 12.4 of Meeus (linear term; sub-arcsec T^2/T^3 dropped)
function siderealTime(d, lw) {
    return rad * (280.46061837 + 360.98564736629 * d) - lw;
}

function astroRefraction(h) {
    if (h < 0) h = 0; // formula valid for positive altitudes only

    // Meeus 16.4: 1.02 / tan(h + 10.26 / (h + 5.10)), h in degrees, arcmin result — folded into rad
    return 0.0002967 / tan(h + 0.00312536 / (h + 0.08901179));
}

// general sun calculations

// Sun's apparent equatorial coordinates, Meeus ch. 25. d = days since J2000 (TT); t = Julian centuries.
function sunCoords(d) {
    const t = d / 36525;
    const L0 = rad * (280.46646 + t * (36000.76983 + t * 0.0003032)); // 25.2 geometric mean longitude
    const M = rad * (357.52911 + t * (35999.05029 - t * 0.0001537)); // 25.3 mean anomaly
    const sinM = sin(M);
    const cosM = cos(M);
    const C = rad * ((1.914602 - t * (0.004817 + t * 0.000014)) * sinM + // equation of center
        (0.019993 - 0.000101 * t) * 2 * sinM * cosM + 0.000289 * sinM * (3 - 4 * sinM * sinM));
    const Om = rad * (125.04 - 1934.136 * t); // longitude of the ascending node
    const L = L0 + C - rad * (0.00569 + 0.00478 * sin(Om)); // apparent longitude (nutation + aberration)
    // 22.2 mean obliquity + 25.8 correction for apparent position
    const e = rad * (23.439291 - t * (0.0130042 + t * (0.00000016 - t * 0.000000504))) + rad * 0.00256 * cos(Om);

    return {
        ra: atan(cos(e) * sin(L), cos(L)), // 25.6
        dec: asin(sin(e) * sin(L)),        // 25.7
        lon: L
    };
}

// calculates sun position for a given date and latitude/longitude
function getPosition(date, lat, lng) {
    const lw = rad * -lng;
    const phi = rad * lat;
    const d = toDays(date);

    const c = sunCoords(toDaysTT(d)); // position series run on Terrestrial Time
    const H = siderealTime(d, lw) - c.ra; // sidereal time stays on UT
    const h = altitude(H, phi, c.dec);

    return {
        azimuth: azimuth(H, phi, c.dec),
        // apparent (refraction-corrected) altitude in degrees
        altitude: (h + astroRefraction(h)) / rad
    };
}

// sun times configuration (angle, morning name, evening name)
const times = [
    [-0.833, 'sunrise', 'sunset'],
    [-0.3, 'sunriseEnd', 'sunsetStart'],
    [-6, 'dawn', 'dusk'],
    [-12, 'nauticalDawn', 'nauticalDusk'],
    [-18, 'nightEnd', 'night'],
    [6, 'goldenHourEnd', 'goldenHour']
];

// calculations for sun times — Meeus ch.15 (rising, transit, setting), solving the Sun's
// local hour angle directly off the same apparent coordinates (sunCoords) and sidereal time
// used by getPosition. Day offsets d are in UT days since J2000; the position series run on TT.

const J0 = 0.0009;

function observerAngle(height) {
    return -2.076 * sqrt(height) / 60;
}

// wrap an angle to (-PI, PI]
function wrapPi(a) {
    return a - 2 * PI * round(a / (2 * PI));
}

// refines a transit time so the Sun's local hour angle is zero (Meeus 15.2; dH/dd ~= 2*PI/day,
// the sidereal excess and the Sun's own motion cancelling to one solar day).
function solarTransit(dt, lw) {
    for (let i = 0; i < 3; i++) {
        const H = wrapPi(siderealTime(dt, lw) - sunCoords(toDaysTT(dt)).ra);
        dt -= H / (2 * PI);
    }
    return dt;
}

// time the Sun reaches altitude h0 on the given side of transit (sign -1 = rise, +1 = set);
// starts from the hour angle at transit and converges with Meeus' altitude correction (15.2).
function getSetJ(h0, dt, sign, lw, phi, decT) {
    const cosH0 = (sin(h0) - sin(phi) * sin(decT)) / (cos(phi) * cos(decT));
    if (cosH0 < -1 || cosH0 > 1) return NaN; // sun stays above / below this altitude all day

    let d = dt + sign * acos(cosH0) / (2 * PI);
    for (let i = 0; i < 2; i++) {
        const c = sunCoords(toDaysTT(d));
        const H = wrapPi(siderealTime(d, lw) - c.ra);
        const h = altitude(H, phi, c.dec);
        const sinH = cos(phi) * cos(c.dec) * sin(H);
        if (abs(sinH) < 1e-6) break; // grazing the horizon — correction is ill-conditioned
        d += (h - h0) / (2 * PI * sinH);
    }
    return d;
}

// start of the civil day containing date in a zone utcOffset minutes ahead of UTC, as a ms timestamp
function civilMidnight(date, utcOffset) {
    const offMs = utcOffset * 60000;
    return floor((date.valueOf() + offMs) / dayMs) * dayMs - offMs;
}

// solar transit (days since J2000) anchoring the day shared by getTimes and getMoonTimes: the one
// nearest the instant (the solar day containing it), or nearest civil noon when an offset is given
function solarDayTransit(date, lw, utcOffset) {
    const anchor = utcOffset === undefined ? date.valueOf() : civilMidnight(date, utcOffset) + dayMs / 2;
    const lon = J0 + lw / (2 * PI);
    return solarTransit(round(toDays(anchor) - lon) + lon, lw);
}

// calculates sun times for a given date, latitude/longitude, and, optionally, the observer height
// (in meters) relative to the horizon and the UTC offset (in minutes) of the observer's time zone

function getTimes(date, lat, lng, height = 0, utcOffset) {

    const lw = rad * -lng;
    const phi = rad * lat;
    const dh = observerAngle(height);
    const dt = solarDayTransit(date, lw, utcOffset);
    const dec = sunCoords(toDaysTT(dt)).dec; // declination at transit, shared by every rise/set solve

    const result = {
        solarNoon: fromJulian(dt + J2000),
        nadir: fromJulian(dt + J2000 - 0.5)
    };

    for (const [angle, riseName, setName] of times) {
        const h0 = (angle + dh) * rad;
        const jrise = getSetJ(h0, dt, -1, lw, phi, dec);
        const jset = getSetJ(h0, dt, 1, lw, phi, dec);

        // a NaN means the Sun never reaches this altitude on this day — report null, not Invalid Date
        result[riseName] = Number.isNaN(jrise) ? null : fromJulian(jrise + J2000);
        result[setName] = Number.isNaN(jset) ? null : fromJulian(jset + J2000);
    }

    // polar day/night: when the Sun never crosses the standard rise/set altitude, flag which side it
    // stays on by comparing its altitude at solar noon (its daily maximum) against that threshold.
    if (result.sunrise === null) {
        const noonAlt = altitude(0, phi, dec);
        const riseSetAlt = (times[0][0] + dh) * rad;
        result.alwaysUp = noonAlt > riseSetAlt;
        result.alwaysDown = noonAlt <= riseSetAlt;
    }

    return result;
}

// moon calculations, based on Meeus ch. 47 (truncated ELP-2000/82 series)

// Nutation in longitude (Δψ) and true obliquity of the ecliptic, both in degrees,
// from the abridged series of Meeus ch. 22 (sub-arcsecond, ample for our needs).
function nutationObliquity(t) {
    const om = rad * (125.04452 - 1934.136261 * t); // longitude of the Moon's ascending node
    const ls = rad * (280.4665 + 36000.7698 * t);   // mean longitude of the Sun
    const lm = rad * (218.3165 + 481267.8813 * t);  // mean longitude of the Moon
    const dpsi = (-17.20 * sin(om) - 1.32 * sin(2 * ls) - 0.23 * sin(2 * lm) + 0.21 * sin(2 * om)) / 3600;
    const deps = (9.20 * cos(om) + 0.57 * cos(2 * ls) + 0.10 * cos(2 * lm) - 0.09 * cos(2 * om)) / 3600;
    const eps0 = 23.439291 - t * (0.0130042 + t * (0.00000016 - t * 0.000000504)); // 22.2 mean obliquity
    return {dpsi, eps: rad * (eps0 + deps)};
}

// Meeus table 47.A — periodic terms for the Moon's longitude (Σl, ×1e-6 deg) and
// distance (Σr, ×1e-3 km). Flat rows of 6: D, M, M', F, Σl, Σr.
const moonLon = new Int32Array([
    0, 0, 1, 0, 6288774, -20905355,  2, 0, -1, 0, 1274027, -3699111,  2, 0, 0, 0, 658314, -2955968,
    0, 0, 2, 0, 213618, -569925,  0, 1, 0, 0, -185116, 48888,  0, 0, 0, 2, -114332, -3149,
    2, 0, -2, 0, 58793, 246158,  2, -1, -1, 0, 57066, -152138,  2, 0, 1, 0, 53322, -170733,
    2, -1, 0, 0, 45758, -204586,  0, 1, -1, 0, -40923, -129620,  1, 0, 0, 0, -34720, 108743,
    0, 1, 1, 0, -30383, 104755,  2, 0, 0, -2, 15327, 10321,  0, 0, 1, 2, -12528, 0,
    0, 0, 1, -2, 10980, 79661,  4, 0, -1, 0, 10675, -34782,  0, 0, 3, 0, 10034, -23210,
    4, 0, -2, 0, 8548, -21636,  2, 1, -1, 0, -7888, 24208,  2, 1, 0, 0, -6766, 30824,
    1, 0, -1, 0, -5163, -8379,  1, 1, 0, 0, 4987, -16675,  2, -1, 1, 0, 4036, -12831,
    2, 0, 2, 0, 3994, -10445,  4, 0, 0, 0, 3861, -11650,  2, 0, -3, 0, 3665, 14403,
    0, 1, -2, 0, -2689, -7003,  2, 0, -1, 2, -2602, 0,  2, -1, -2, 0, 2390, 10056,
    1, 0, 1, 0, -2348, 6322,  2, -2, 0, 0, 2236, -9884,  0, 1, 2, 0, -2120, 5751,
    0, 2, 0, 0, -2069, 0,  2, -2, -1, 0, 2048, -4950,  2, 0, 1, -2, -1773, 4130,
    2, 0, 0, 2, -1595, 0,  4, -1, -1, 0, 1215, -3958,  0, 0, 2, 2, -1110, 0,
    3, 0, -1, 0, -892, 3258,  2, 1, 1, 0, -810, 2616,  4, -1, -2, 0, 759, -1897,
    0, 2, -1, 0, -713, -2117,  2, 2, -1, 0, -700, 2354,  2, 1, -2, 0, 691, 0,
    2, -1, 0, -2, 596, 0,  4, 0, 1, 0, 549, -1423,  0, 0, 4, 0, 537, -1117,
    4, -1, 0, 0, 520, -1571,  1, 0, -2, 0, -487, -1739,  2, 1, 0, -2, -399, 0,
    0, 0, 2, -2, -381, -4421,  1, 1, 1, 0, 351, 0,  3, 0, -2, 0, -340, 0,
    4, 0, -3, 0, 330, 0,  2, -1, 2, 0, 327, 0,  0, 2, 1, 0, -323, 1165,
    1, 1, -1, 0, 299, 0,  2, 0, 3, 0, 294, 0,  2, 0, -1, -2, 0, 8752
]);

// Meeus table 47.B — periodic terms for the Moon's latitude (Σb, ×1e-6 deg).
// Flat rows of 5: D, M, M', F, Σb.
const moonLat = new Int32Array([
    0, 0, 0, 1, 5128122,  0, 0, 1, 1, 280602,  0, 0, 1, -1, 277693,  2, 0, 0, -1, 173237,
    2, 0, -1, 1, 55413,  2, 0, -1, -1, 46271,  2, 0, 0, 1, 32573,  0, 0, 2, 1, 17198,
    2, 0, 1, -1, 9266,  0, 0, 2, -1, 8822,  2, -1, 0, -1, 8216,  2, 0, -2, -1, 4324,
    2, 0, 1, 1, 4200,  2, 1, 0, -1, -3359,  2, -1, -1, 1, 2463,  2, -1, 0, 1, 2211,
    2, -1, -1, -1, 2065,  0, 1, -1, -1, -1870,  4, 0, -1, -1, 1828,  0, 1, 0, 1, -1794,
    0, 0, 0, 3, -1749,  0, 1, -1, 1, -1565,  1, 0, 0, 1, -1491,  0, 1, 1, 1, -1475,
    0, 1, 1, -1, -1410,  0, 1, 0, -1, -1344,  1, 0, 0, -1, -1335,  0, 0, 3, 1, 1107,
    4, 0, 0, -1, 1021,  4, 0, -1, 1, 833,  0, 0, 1, -3, 777,  4, 0, -2, 1, 671,
    2, 0, 0, -3, 607,  2, 0, 2, -1, 596,  2, -1, 1, -1, 491,  2, 0, -2, 1, -451,
    0, 0, 3, -1, 439,  2, 0, 2, 1, 422,  2, 0, -3, -1, 421,  2, 1, -1, 1, -366,
    2, 1, 0, 1, -351,  4, 0, 0, 1, 331,  2, -1, 1, 1, 315,  2, -2, 0, -1, 302,
    0, 0, 1, 3, -283,  2, 1, 1, -1, -229,  1, 1, 0, -1, 223,  1, 1, 0, 1, 223,
    0, 1, -2, -1, -220,  2, 1, -1, -1, -220,  1, 0, 1, 1, -185,  2, -1, -2, -1, 181,
    0, 1, 2, 1, -177,  4, 0, -2, -1, 176,  4, -1, -1, -1, 166,  1, 0, 1, -1, -164,
    4, 0, 1, -1, 132,  1, 0, -1, -1, -119,  4, -1, 0, -1, 115,  2, -2, 0, 1, 107
]);

// geocentric apparent equatorial coordinates of the Moon, Meeus ch. 47. d = days since J2000 (TT).
function moonCoords(d) {
    const t = d / 36525;

    // fundamental arguments (degrees), 47.1–47.6
    const Lp = 218.3164477 + t * (481267.88123421 + t * (-0.0015786 + t * (1 / 538841 - t / 65194000)));
    const D = 297.8501921 + t * (445267.1114034 + t * (-0.0018819 + t * (1 / 545868 - t / 113065000)));
    const M = 357.5291092 + t * (35999.0502909 + t * (-0.0001536 + t / 24490000));
    const Mp = 134.9633964 + t * (477198.8675055 + t * (0.0087414 + t * (1 / 69699 - t / 14712000)));
    const F = 93.2720950 + t * (483202.0175233 + t * (-0.0036539 + t * (-1 / 3526000 + t / 863310000)));
    const A1 = 119.75 + 131.849 * t;
    const A2 = 53.09 + 479264.290 * t;
    const A3 = 313.45 + 481266.484 * t;
    const E = 1 - t * (0.002516 + t * 0.0000074); // eccentricity factor for solar-anomaly terms

    const Dr = rad * D, Mr = rad * M, Mpr = rad * Mp, Fr = rad * F;
    let sl = 0, sr = 0, sb = 0;
    for (let i = 0; i < moonLon.length; i += 6) {
        const m = moonLon[i + 1];
        const arg = moonLon[i] * Dr + m * Mr + moonLon[i + 2] * Mpr + moonLon[i + 3] * Fr;
        const f = m === 1 || m === -1 ? E : m === 2 || m === -2 ? E * E : 1;
        sl += moonLon[i + 4] * f * sin(arg);
        sr += moonLon[i + 5] * f * cos(arg);
    }
    for (let i = 0; i < moonLat.length; i += 5) {
        const m = moonLat[i + 1];
        const arg = moonLat[i] * Dr + m * Mr + moonLat[i + 2] * Mpr + moonLat[i + 3] * Fr;
        const f = m === 1 || m === -1 ? E : m === 2 || m === -2 ? E * E : 1;
        sb += moonLat[i + 4] * f * sin(arg);
    }

    // additive terms (Venus, Jupiter and flattening of the Earth), 47 p.342
    const A1r = rad * A1, Lpr = rad * Lp;
    sl += 3958 * sin(A1r) + 1962 * sin(Lpr - Fr) + 318 * sin(rad * A2);
    sb += -2235 * sin(Lpr) + 382 * sin(rad * A3) + 175 * sin(A1r - Fr) + 175 * sin(A1r + Fr) +
        127 * sin(Lpr - Mpr) - 115 * sin(Lpr + Mpr);

    const {dpsi, eps} = nutationObliquity(t);
    const l = rad * (Lp + sl / 1e6 + dpsi); // apparent ecliptic longitude
    const b = rad * (sb / 1e6);             // ecliptic latitude

    return {
        ra: atan(sin(l) * cos(eps) - tan(b) * sin(eps), cos(l)),  // 13.3
        dec: asin(sin(b) * cos(eps) + cos(b) * sin(eps) * sin(l)), // 13.4
        dist: 385000.56 + sr / 1000, // distance to the Moon in km
        lon: l
    };
}

function getMoonPosition(date, lat, lng) {
    const lw = rad * -lng;
    const phi = rad * lat;
    const d = toDays(date);
    const c = moonCoords(toDaysTT(d));    // position series run on Terrestrial Time
    const H = siderealTime(d, lw) - c.ra; // sidereal time stays on UT

    // geocentric parallax (Meeus ch.40) lowers the moon along its vertical circle, leaving
    // azimuth unchanged; sin(parallax) = (Earth radius / distance) * cos(geocentric altitude).
    const hGeo = altitude(H, phi, c.dec);
    const h = hGeo - asin(earthRadius / c.dist * cos(hGeo));

    // parallactic angle, Meeus 14.1
    const pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

    return {
        azimuth: azimuth(H, phi, c.dec),
        // apparent (refraction-corrected) altitude in degrees
        altitude: (h + astroRefraction(h)) / rad,
        distance: c.dist,
        parallacticAngle: pa / rad
    };
}

// moon illumination parameters, Meeus ch. 48 (and idlastro's mphase.pro)
function getMoonIllumination(date = new Date()) {
    const d = toDaysTT(toDays(date));
    const s = sunCoords(d);
    const m = moonCoords(d);
    const sdist = 149598000; // distance from Earth to Sun in km
    const phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra));
    const inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi));
    const angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
        cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));

    // elongation in ecliptic longitude, which defines the named phases (Meeus ch. 49, USNO); the RA
    // difference behind `angle` crosses 0/180° hours off conjunction/opposition near the nodes
    const phase = (((m.lon - s.lon) / (2 * PI)) % 1 + 1) % 1;
    const waxing = phase < 0.5;

    return {
        // illuminated fraction, 0 (new) → 1 (full); reaches the exact extrema only at perfect
        // syzygy (eclipses), so a "full" moon typically peaks a hair under 1 — this is correct
        fraction: (1 + cos(inc)) / 2,
        // phase, 0 → 1: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter (waxing for phase < 0.5)
        phase,
        // position angle of the bright limb, degrees (v2: all angles emitted in degrees) — subtract
        // getMoonPosition().parallacticAngle, also degrees, to get the zenith-relative tilt
        angle: angle / rad,
        waxing // true while the Moon is waxing (new → full), false while waning (full → new)
    };
}

return { getPosition, getTimes, getMoonPosition, getMoonIllumination };
})();

// The drawing (viewBox 1440 x 900, horizon at y 522)
const SCENE = `<svg class="sky-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<defs>
<linearGradient id="sky-skyG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="522"><stop offset="0" style="stop-color: var(--sk-sky1, #2C66B6)"></stop><stop offset="0.276" style="stop-color: var(--sk-sky1, #2C66B6)"></stop><stop offset="0.759" style="stop-color: var(--sk-sky2, #3F8BCB)"></stop><stop offset="1" style="stop-color: var(--sk-sky3, #BDEDE4)"></stop></linearGradient>
<path id="sky-spk" d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2 Z"></path>
<path id="sky-tri" d="M-6 0 L6 0 L0 5 Z"></path>
<path id="sky-ray" d="M0 0 L900 -50 L900 50 Z"></path>
<path id="sky-rayT" d="M0 0 L900 -24 L900 24 Z"></path>
<radialGradient id="sky-sunGlow"><stop offset="0" style="stop-color: var(--sk-sunC, #FFF6D8); stop-opacity: 0.5"></stop><stop offset="1" style="stop-color: var(--sk-sunC, #FFF6D8); stop-opacity: 0"></stop></radialGradient>
<radialGradient id="sky-rayG" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="900"><stop offset="0" style="stop-color: var(--sk-sunC, #FFF6D8); stop-opacity: 0.5"></stop><stop offset="0.55" style="stop-color: var(--sk-sunC, #FFF6D8); stop-opacity: 0.14"></stop><stop offset="1" style="stop-color: var(--sk-sunC, #FFF6D8); stop-opacity: 0"></stop></radialGradient>
<radialGradient id="sky-bokehG"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"></stop><stop offset="0.7" stop-color="#FFFFFF" stop-opacity="0.1"></stop><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop></radialGradient>
<linearGradient id="sky-aurG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#6CFFC9" stop-opacity="0"></stop><stop offset="0.25" stop-color="#6CFFC9" stop-opacity="0.75"></stop><stop offset="1" stop-color="#9B7BFF" stop-opacity="0"></stop></linearGradient>
<linearGradient id="sky-aurP" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF9BD8" stop-opacity="0"></stop><stop offset="0.3" stop-color="#FF9BD8" stop-opacity="0.5"></stop><stop offset="1" stop-color="#7C8CFF" stop-opacity="0"></stop></linearGradient>
<filter id="sky-aurBlur" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="5"></feGaussianBlur></filter>
<linearGradient id="sky-msG" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="-72"><stop offset="0" stop-color="#FFFFFF" stop-opacity="1"></stop><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop></linearGradient>
<linearGradient id="sky-lhBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF3C4" stop-opacity="0.6"></stop><stop offset="1" stop-color="#FFF3C4" stop-opacity="0"></stop></linearGradient>
<filter id="sky-bioBlur" x="-5%" y="-200%" width="110%" height="500%"><feGaussianBlur stdDeviation="3"></feGaussianBlur></filter>
<linearGradient id="sky-seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--sk-seaFar, #0E86B4)"></stop><stop offset="0.12" style="stop-color: var(--sk-seaFar, #0E86B4)"></stop><stop offset="1" style="stop-color: var(--sk-seaNear, #38C8E0)"></stop></linearGradient>
<filter id="sky-soft" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="7"></feGaussianBlur></filter>
<clipPath id="sky-cSky">
<path d="M1040 170 a40 40 0 0 1 58 -46 a56 56 0 0 1 104 -24 a46 46 0 0 1 86 26 a34 34 0 0 1 56 18 a32 32 0 0 1 56 26 Z"></path>
<path d="M1150 300 a24 24 0 0 1 36 -30 a34 34 0 0 1 64 -6 a28 28 0 0 1 40 36 Z"></path>
<path d="M800 230 a22 22 0 0 1 34 -26 a30 30 0 0 1 56 -2 a22 22 0 0 1 30 28 Z"></path>
</clipPath>
<clipPath id="sky-cHor">
<path d="M40 522 a30 30 0 0 1 50 -32 a40 40 0 0 1 76 -12 a34 34 0 0 1 64 10 a44 44 0 0 1 86 -4 a36 36 0 0 1 66 18 a22 22 0 0 1 38 20 Z"></path>
<path d="M560 522 a36 36 0 0 1 56 -40 a52 52 0 0 1 96 -26 a42 42 0 0 1 80 8 a48 48 0 0 1 92 -6 a40 40 0 0 1 72 30 a28 28 0 0 1 44 34 Z"></path>
</clipPath>
<clipPath id="sky-cHorC"><path d="M1030 522 a26 26 0 0 1 42 -26 a36 36 0 0 1 66 -8 a30 30 0 0 1 52 34 Z"></path></clipPath>
<pattern id="sky-cwin" width="28" height="13" patternUnits="userSpaceOnUse"><rect x="4" y="0" width="18" height="13" fill="#2B3A4A"></rect></pattern>
<pattern id="sky-litc" width="28" height="13" patternUnits="userSpaceOnUse"><rect x="4" y="0" width="18" height="13" fill="#FFE3A3"></rect></pattern>
<pattern id="sky-grille" width="6" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="2" height="20" fill="#9AA6B2"></rect></pattern>
<pattern id="sky-piers" width="120" height="58" patternUnits="userSpaceOnUse"><rect x="52" y="0" width="18" height="58" fill="#D3CCBC"></rect><rect x="64" y="0" width="6" height="58" fill="#A39C8C"></rect></pattern>
<pattern id="sky-rails" width="24" height="12" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="2" height="12" fill="#5A6270"></rect></pattern>
<linearGradient id="sky-fadeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"></stop><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop></linearGradient>
<mask id="sky-fade" maskUnits="userSpaceOnUse" x="0" y="712" width="1440" height="188"><rect x="0" y="712" width="1440" height="188" fill="url(#sky-fadeG)"></rect></mask>
<mask id="sky-fadeIsl" maskUnits="userSpaceOnUse" x="0" y="522" width="1440" height="60"><rect x="0" y="522" width="1440" height="60" fill="url(#sky-fadeG)"></rect></mask>
<filter id="sky-ripple" x="-2%" y="-10%" width="104%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.002 0.16" numOctaves="1" seed="4"></feTurbulence><feDisplacementMap in="SourceGraphic" scale="14" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap></filter>
</defs>
<rect x="-1200" y="-1200" width="3840" height="1722" fill="url(#sky-skyG)"></rect>
<g class="sky-pz sky-pz1">
<g style="fill: var(--sk-haze, #FFFFFF)" opacity="0.14">
<polygon points="160,522 420,292 680,522"></polygon>
<polygon points="520,522 700,360 880,522"></polygon>
<polygon points="900,522 1180,322 1460,522"></polygon>
</g>
<g style="opacity: var(--sk-bokeh, 0)">
<circle cx="1180" cy="230" r="22" fill="url(#sky-bokehG)"></circle><circle cx="880" cy="400" r="16" fill="url(#sky-bokehG)"></circle><circle cx="1370" cy="410" r="18" fill="url(#sky-bokehG)"></circle><circle cx="1010" cy="110" r="14" fill="url(#sky-bokehG)"></circle><circle cx="760" cy="300" r="12" fill="url(#sky-bokehG)"></circle><circle cx="1290" cy="90" r="16" fill="url(#sky-bokehG)"></circle>
</g>
<g style="opacity: var(--sk-auroraO, 0)" filter="url(#sky-aurBlur)">
<g class="sky-aur"><path d="M600 190 C720 140 860 220 1000 160 C1140 100 1260 170 1460 110 L1460 30 C1260 90 1140 20 1000 80 C860 140 720 60 600 110 Z" fill="url(#sky-aurG)"></path></g>
<g class="sky-aur sky-aur2"><path d="M760 250 C880 214 1000 268 1130 226 C1260 184 1360 222 1460 200 L1460 156 C1360 178 1260 140 1130 182 C1000 224 880 170 760 206 Z" fill="url(#sky-aurP)"></path>
<path d="M900 120 C1020 84 1140 132 1260 96 C1340 72 1400 84 1460 76 L1460 50 C1400 58 1340 46 1260 70 C1140 106 1020 58 900 94 Z" fill="url(#sky-aurG)"></path></g>
</g>
<g class="sky-cl3" style="fill: var(--sk-wisp, #E9F4FF); opacity: var(--sk-wispO, 0)">
<path d="M760 120 C900 96 1120 92 1460 104 C1260 122 1000 132 760 120 Z" opacity="0.7"></path>
<path d="M880 176 C1040 158 1240 156 1460 168 C1300 180 1080 188 880 176 Z" opacity="0.55"></path>
<path d="M720 262 C860 246 1060 240 1300 250 C1120 264 920 270 720 262 Z" opacity="0.6"></path>
<path d="M980 330 C1120 318 1300 316 1460 322 C1320 334 1140 340 980 330 Z" opacity="0.5"></path>
<path d="M760 410 C900 398 1080 394 1260 400 C1100 412 920 418 760 410 Z" opacity="0.45"></path>
<path d="M1060 452 C1180 444 1340 442 1460 446 C1330 456 1190 460 1060 452 Z" opacity="0.5"></path>
</g>
<g style="opacity: var(--sk-stars, 0.12)">
<g style="fill: var(--sk-spark, #FFFFFF)">
<g class="sky-tw1"><use href="#sky-spk" transform="translate(760 96)"></use><use href="#sky-spk" transform="translate(1010 60) scale(0.7)"></use><use href="#sky-spk" transform="translate(1300 210) scale(0.8)"></use><use href="#sky-spk" transform="translate(900 330) scale(0.6)"></use><use href="#sky-spk" transform="translate(1180 400) scale(0.9)"></use><use href="#sky-spk" transform="translate(820 420) scale(0.5)"></use></g>
<g class="sky-tw2"><use href="#sky-spk" transform="translate(690 40) scale(0.6)"></use><use href="#sky-spk" transform="translate(1120 250) scale(0.7)"></use><use href="#sky-spk" transform="translate(1380 330) scale(0.6)"></use><use href="#sky-spk" transform="translate(980 180) scale(0.5)"></use><use href="#sky-spk" transform="translate(1250 40) scale(0.8)"></use><use href="#sky-spk" transform="translate(560 60) scale(0.5)"></use></g>
<g class="sky-tw3"><use href="#sky-spk" transform="translate(1060 380) scale(0.6)"></use><use href="#sky-spk" transform="translate(1340 120) scale(0.5)"></use><use href="#sky-spk" transform="translate(760 260) scale(0.7)"></use><use href="#sky-spk" transform="translate(930 450) scale(0.5)"></use><use href="#sky-spk" transform="translate(1420 440) scale(0.6)"></use><use href="#sky-spk" transform="translate(640 300) scale(0.4)"></use></g>
<g class="sky-tw2"><circle cx="720" cy="150" r="1.8"></circle><circle cx="850" cy="120" r="1.4"></circle><circle cx="950" cy="230" r="2"></circle><circle cx="1030" cy="300" r="1.5"></circle><circle cx="1110" cy="140" r="1.8"></circle><circle cx="1210" cy="180" r="1.4"></circle><circle cx="1270" cy="300" r="2"></circle><circle cx="1390" cy="200" r="1.5"></circle><circle cx="450" cy="40" r="1.4"></circle><circle cx="150" cy="30" r="1.6"></circle></g>
<g class="sky-tw1"><circle cx="1160" cy="350" r="1.6"></circle><circle cx="880" cy="380" r="1.4"></circle><circle cx="790" cy="330" r="1.8"></circle><circle cx="1330" cy="400" r="1.5"></circle><circle cx="1000" cy="420" r="1.4"></circle><circle cx="1080" cy="470" r="1.6"></circle><circle cx="1230" cy="450" r="1.4"></circle><circle cx="600" cy="200" r="1.5"></circle><circle cx="300" cy="60" r="1.4"></circle><circle cx="680" cy="460" r="1.6"></circle></g>
</g>
</g>
<g style="fill: var(--sk-streak, #2A5DAA); opacity: var(--sk-streakO, 0.4)">
<path d="M1340 40 Q1160 140 980 250 Q1172 128 1340 40 Z"></path>
<path d="M1440 120 Q1278 206 1120 300 Q1290 196 1440 120 Z"></path>
<path d="M1180 30 Q1040 92 900 160 Q1050 84 1180 30 Z"></path>
<path d="M1460 250 Q1344 304 1240 360 Q1352 296 1460 250 Z"></path>
</g>
<g style="fill: var(--sk-meteor, #FFFFFF); opacity: var(--sk-meteorO, 0.35)">
<polygon points="1000,300 1006,306 1420,58"></polygon>
<polygon points="1120,372 1125,377 1450,182"></polygon>
<polygon points="1010,212 1014,216 1300,40"></polygon>
<polygon points="1240,424 1244,428 1450,302"></polygon>
<polygon points="820,190 823,193 1000,86"></polygon>
<polygon points="1290,250 1293,253 1440,166"></polygon>
<polygon points="900,440 903,443 1080,336"></polygon>
</g>
<g style="opacity: var(--sk-shootO, 0)">
<g transform="translate(1280 90)"><g class="sky-ms"><path d="M0 0 L120 -72" stroke="url(#sky-msG)" stroke-width="2.5" stroke-linecap="round"></path><circle cx="0" cy="0" r="2.6" fill="#FFFFFF"></circle></g></g>
<g transform="translate(1060 150)"><g class="sky-ms sky-ms2"><path d="M0 0 L120 -72" stroke="url(#sky-msG)" stroke-width="2.5" stroke-linecap="round"></path><circle cx="0" cy="0" r="2.6" fill="#FFFFFF"></circle></g></g>
<g transform="translate(1400 260)"><g class="sky-ms sky-ms3"><path d="M0 0 L120 -72" stroke="url(#sky-msG)" stroke-width="2.5" stroke-linecap="round"></path><circle cx="0" cy="0" r="2.6" fill="#FFFFFF"></circle></g></g>
<g transform="translate(940 60)"><g class="sky-ms sky-ms4"><path d="M0 0 L120 -72" stroke="url(#sky-msG)" stroke-width="2.5" stroke-linecap="round"></path><circle cx="0" cy="0" r="2.6" fill="#FFFFFF"></circle></g></g>
</g>
</g>
<g class="sky-pz sky-pz2">
<g style="transform: translate(var(--sk-sx, 900px), var(--sk-sy, 200px)); opacity: var(--sk-raysO, 0)">
<g class="sky-rays" style="fill: url(#sky-rayG)">
<use href="#sky-ray"></use><use href="#sky-rayT" transform="rotate(30)"></use><use href="#sky-ray" transform="rotate(60)"></use><use href="#sky-rayT" transform="rotate(90)"></use><use href="#sky-ray" transform="rotate(120)"></use><use href="#sky-rayT" transform="rotate(150)"></use>
<use href="#sky-ray" transform="rotate(180)"></use><use href="#sky-rayT" transform="rotate(210)"></use><use href="#sky-ray" transform="rotate(240)"></use><use href="#sky-rayT" transform="rotate(270)"></use><use href="#sky-ray" transform="rotate(300)"></use><use href="#sky-rayT" transform="rotate(330)"></use>
</g>
</g>
<g style="transform: translate(var(--sk-sx, 900px), var(--sk-sy, 200px)); opacity: var(--sk-sunO, 1)">
<circle cx="0" cy="0" r="120" fill="url(#sky-sunGlow)"></circle>
<circle cx="0" cy="0" r="46" style="fill: var(--sk-sunC, #FFF6D8)" opacity="0.32"></circle>
<circle cx="0" cy="0" r="32" style="fill: var(--sk-sunC, #FFF6D8)"></circle>
</g>
<g style="transform: translate(var(--sk-mx, 1100px), var(--sk-my, 900px)); opacity: var(--sk-moonO, 0)">
<circle cx="0" cy="0" r="26" fill="#FFFFFF" opacity="0.12"></circle>
<g class="sky-mlit" style="transform: rotate(var(--sk-mrot, 0deg))">
<circle cx="0" cy="0" r="26" fill="none"></circle>
<path id="sky-moonpath" d="M0 -26 A26 26 0 0 1 0 26 A20 26 0 0 0 0 -26 Z" fill="#FFFFFF"></path>
</g>
</g>
</g>
<g class="sky-pz sky-pz3">
<g class="sky-cl1">
<g style="fill: var(--sk-cloud, #FBF7EA)">
<path d="M1040 170 a40 40 0 0 1 58 -46 a56 56 0 0 1 104 -24 a46 46 0 0 1 86 26 a34 34 0 0 1 56 18 a32 32 0 0 1 56 26 Z"></path>
<path d="M1150 300 a24 24 0 0 1 36 -30 a34 34 0 0 1 64 -6 a28 28 0 0 1 40 36 Z"></path>
<path class="sky-hi" d="M800 230 a22 22 0 0 1 34 -26 a30 30 0 0 1 56 -2 a22 22 0 0 1 30 28 Z"></path>
</g>
<g style="fill: var(--sk-shade, #E4E6F4)" clip-path="url(#sky-cSky)">
<rect x="1030" y="156" width="380" height="14"></rect>
<rect x="1140" y="290" width="160" height="10"></rect>
<rect class="sky-hi" x="790" y="220" width="140" height="10"></rect>
</g>
</g>
<g style="opacity: var(--sk-birdsO, 1)" fill="none" stroke="#2E3D63" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
<g class="sky-gull"><g class="sky-bob1"><path class="sky-wing" d="M-14 0 Q-7 -8 0 0 Q7 -8 14 0"></path></g></g>
<g class="sky-gull sky-gl2"><g class="sky-bob2"><path class="sky-wing sky-wing2" d="M-10 0 Q-5 -6 0 0 Q5 -6 10 0"></path></g></g>
<g class="sky-gull sky-gl3"><g class="sky-bob1"><path class="sky-wing sky-wing2" d="M-8 0 Q-4 -5 0 0 Q4 -5 8 0" stroke-width="2"></path></g></g>
</g>
</g>
<g class="sky-pz sky-pz2">
<g class="sky-cl2">
<path class="sky-hi" d="M600 522 a64 64 0 0 1 118 -44 a72 72 0 0 1 140 -10 a62 62 0 0 1 118 14 a40 40 0 0 1 60 40 Z" style="fill: var(--sk-back, #CDEFEA)" filter="url(#sky-soft)"></path>
<g style="fill: var(--sk-cloud, #FBF7EA)">
<path d="M40 522 a30 30 0 0 1 50 -32 a40 40 0 0 1 76 -12 a34 34 0 0 1 64 10 a44 44 0 0 1 86 -4 a36 36 0 0 1 66 18 a22 22 0 0 1 38 20 Z"></path>
<path d="M560 522 a36 36 0 0 1 56 -40 a52 52 0 0 1 96 -26 a42 42 0 0 1 80 8 a48 48 0 0 1 92 -6 a40 40 0 0 1 72 30 a28 28 0 0 1 44 34 Z"></path>
<path class="sky-hi" d="M1030 522 a26 26 0 0 1 42 -26 a36 36 0 0 1 66 -8 a30 30 0 0 1 52 34 Z"></path>
</g>
<rect x="0" y="504" width="1440" height="18" style="fill: var(--sk-shade, #E4E6F4)" clip-path="url(#sky-cHor)"></rect>
<rect class="sky-hi" x="1020" y="504" width="180" height="18" style="fill: var(--sk-shade, #E4E6F4)" clip-path="url(#sky-cHorC)"></rect>
</g>
<g style="transform: translateX(var(--sk-sx, 900px)); opacity: var(--sk-hazeO, 0)">
<ellipse cx="0" cy="522" rx="340" ry="120" fill="url(#sky-sunGlow)"></ellipse>
</g>
</g>
<rect x="-1200" y="522" width="3840" height="478" fill="url(#sky-seaG)"></rect>
<g style="fill: var(--sk-strip, #8BEAF3)">
<g class="sky-dr1" opacity="0.7">
<rect x="60" y="534" width="220" height="3" rx="1.5"></rect><rect x="900" y="546" width="260" height="4" rx="2"></rect><rect x="700" y="564" width="300" height="5" rx="2.5"></rect><rect x="1060" y="590" width="240" height="6" rx="3"></rect>
<rect x="120" y="730" width="360" height="8" rx="4"></rect><rect x="300" y="788" width="380" height="10" rx="5"></rect>
</g>
<g class="sky-dr2" opacity="0.55">
<rect x="520" y="538" width="160" height="3" rx="1.5"></rect><rect x="240" y="552" width="180" height="4" rx="2"></rect><rect x="40" y="578" width="260" height="5" rx="2.5"></rect><rect x="420" y="606" width="280" height="6" rx="3"></rect>
<rect x="860" y="756" width="420" height="8" rx="4"></rect><rect x="1000" y="798" width="300" height="9" rx="4.5"></rect>
</g>
</g>
<g style="fill: var(--sk-foam, #FFFFFF)">
<g class="sky-dr2"><g class="sky-sh1"><rect x="180" y="744" width="34" height="3" rx="1.5"></rect><rect x="560" y="772" width="24" height="3" rx="1.5"></rect><rect x="1180" y="782" width="40" height="3" rx="1.5"></rect></g></g>
<g class="sky-dr1"><g class="sky-sh2"><rect x="980" y="738" width="26" height="3" rx="1.5"></rect><rect x="420" y="808" width="38" height="4" rx="2"></rect><rect x="60" y="796" width="28" height="3" rx="1.5"></rect><rect x="620" y="560" width="18" height="2" rx="1"></rect><rect x="320" y="596" width="22" height="2" rx="1"></rect></g></g>
</g>
<g style="fill: var(--sk-glintT, #5FE3F4)">
<g class="sky-tw1"><use href="#sky-tri" transform="translate(90 540)"></use><use href="#sky-tri" transform="translate(106 540)"></use><use href="#sky-tri" transform="translate(470 548) scale(1.2)"></use><use href="#sky-tri" transform="translate(860 544)"></use><use href="#sky-tri" transform="translate(876 544)"></use><use href="#sky-tri" transform="translate(1300 552) scale(1.2)"></use></g>
<g class="sky-tw3"><use href="#sky-tri" transform="translate(300 566) scale(1.3)"></use><use href="#sky-tri" transform="translate(640 574) scale(1.3)"></use><use href="#sky-tri" transform="translate(1010 568) scale(1.3)"></use><use href="#sky-tri" transform="translate(1026 568) scale(1.3)"></use><use href="#sky-tri" transform="translate(1390 580) scale(1.4)"></use><use href="#sky-tri" transform="translate(180 600) scale(1.5)"></use></g>
</g>
<g class="sky-pz sky-pz2">
<g style="transform: translateX(var(--sk-lx, 900px)); opacity: var(--sk-colO, 0.8); fill: var(--sk-glint, #FFFFFF)">
<g class="sky-sh1">
<rect x="-7" y="526" width="14" height="2" rx="1"></rect><rect x="-10" y="539" width="22" height="3" rx="1.5"></rect><rect x="-17" y="556" width="30" height="3" rx="1.5"></rect><rect x="-18" y="578" width="40" height="4" rx="2"></rect><rect x="-27" y="606" width="48" height="5" rx="2.5"></rect>
<rect x="-26" y="640" width="58" height="5" rx="2.5"></rect><rect x="-38" y="682" width="70" height="6" rx="3"></rect><rect x="-40" y="732" width="84" height="7" rx="3.5"></rect><rect x="-54" y="790" width="100" height="8" rx="4"></rect>
</g>
<g class="sky-sh2">
<rect x="-11" y="532" width="18" height="2" rx="1"></rect><rect x="-12" y="547" width="26" height="3" rx="1.5"></rect><rect x="-15" y="566" width="34" height="4" rx="2"></rect><rect x="-24" y="591" width="44" height="4" rx="2"></rect><rect x="-25" y="622" width="54" height="5" rx="2.5"></rect>
<rect x="-34" y="660" width="64" height="6" rx="3"></rect><rect x="-34" y="706" width="76" height="7" rx="3.5"></rect><rect x="-48" y="760" width="92" height="8" rx="4"></rect>
</g>
</g>
</g>
<g style="fill: var(--sk-spark, #FFFFFF); opacity: calc(var(--sk-stars, 0.12) * 0.8 + 0.2)">
<g class="sky-tw2"><use href="#sky-spk" transform="translate(140 528) scale(0.45)"></use><use href="#sky-spk" transform="translate(700 526) scale(0.4)"></use><use href="#sky-spk" transform="translate(1240 528) scale(0.45)"></use></g>
<g class="sky-tw3"><use href="#sky-spk" transform="translate(420 530) scale(0.4)"></use><use href="#sky-spk" transform="translate(980 532) scale(0.45)"></use><use href="#sky-spk" transform="translate(1380 531) scale(0.4)"></use></g>
</g>
<g class="sky-pz sky-pz2">
<g style="filter: brightness(var(--sk-lit, 1)) sepia(var(--sk-warm, 0)) hue-rotate(var(--sk-hue, 0deg)) saturate(var(--sk-sat, 1))">
<g class="sky-isl"><g transform="translate(-260 0)">
<g fill="#24505C">
<path d="M1120 522 Q1150 507 1190 509 Q1240 500 1290 512 Q1316 516 1332 522 Z"></path>
<path d="M1176 509 Q1172 490 1180 472" fill="none" stroke="#24505C" stroke-width="3"></path>
<path d="M1180 472 q-12 -4 -22 4 M1180 472 q12 -4 22 4 M1180 472 q-4 -10 -14 -14 M1180 472 q4 -10 14 -14" fill="none" stroke="#24505C" stroke-width="4" stroke-linecap="round"></path>
<path d="M1232 504 Q1230 484 1238 464" fill="none" stroke="#24505C" stroke-width="3"></path>
<path d="M1238 464 q-12 -4 -22 4 M1238 464 q12 -4 22 4 M1238 464 q-4 -10 -14 -14 M1238 464 q4 -10 14 -14" fill="none" stroke="#24505C" stroke-width="4" stroke-linecap="round"></path>
<rect x="1283" y="508" width="26" height="8" rx="2"></rect>
</g>
<path d="M1150 513 Q1190 506 1230 505" fill="none" stroke="#3E7F86" stroke-width="3" stroke-linecap="round"></path>
<path d="M1288 510 L1291 462 L1301 462 L1304 510 Z" fill="#F6F1E7"></path>
<path d="M1288.75 498 L1289.4 488 L1302.6 488 L1303.25 498 Z M1290.1 476 L1290.75 466 L1301.25 466 L1301.9 476 Z" fill="#E4575B"></path>
<rect x="1287" y="458" width="18" height="4" rx="1" fill="#2E3D63"></rect>
<rect x="1291" y="448" width="10" height="10" fill="#FFE9A8"></rect>
<rect x="1295.4" y="448" width="1.2" height="10" fill="#2E3D63"></rect>
<path d="M1289 448 L1296 439 L1303 448 Z" fill="#E4575B"></path>
<circle cx="1296" cy="438" r="1.6" fill="#2E3D63"></circle>
<g mask="url(#sky-fadeIsl)" opacity="0.4"><g transform="translate(0 1044) scale(1 -1)" filter="url(#sky-ripple)"><path d="M1120 522 Q1150 507 1190 509 Q1240 500 1290 512 Q1316 516 1332 522 Z" fill="#24505C"></path><path d="M1288 522 L1291 462 L1301 462 L1304 522 Z" fill="#F6F1E7"></path></g></g>
</g></g>
<g class="sky-boat"><g transform="translate(0 556) scale(0.8)"><g class="sky-rock">
<rect x="-1.2" y="-52" width="2.4" height="50" fill="#2E3D63"></rect>
<path d="M3 -50 L3 -6 L30 -6 Z" fill="#FFFFFF"></path>
<path d="M-2 -45 L-2 -6 L-22 -6 Z" fill="#F3E6D3"></path>
<path d="M1 -52 L12 -48 L1 -44 Z" fill="#E4575B"></path>
<path d="M-26 -2 L26 -2 L19 7 L-19 7 Z" fill="#2E3D63"></path>
<g transform="translate(0 14) scale(1 -0.6)" opacity="0.22"><path d="M3 -50 L3 -6 L30 -6 Z" fill="#FFFFFF"></path><path d="M-2 -45 L-2 -6 L-22 -6 Z" fill="#FFFFFF"></path><path d="M-26 -2 L26 -2 L19 7 L-19 7 Z" fill="#2E3D63"></path></g>
</g></g></g>
</g>
<g style="opacity: var(--sk-glow, 0)">
<g class="sky-boat"><g transform="translate(0 556) scale(0.8)"><g class="sky-rock"><circle cx="0" cy="-2" r="9" fill="#FFDC8C" opacity="0.45"></circle><circle cx="0" cy="-2" r="2.6" fill="#FFF3CC"></circle></g></g></g>
</g>
<g class="sky-isl" style="opacity: var(--sk-beamO, 0)">
<g transform="translate(1036 453)">
<g class="sky-beam"><path d="M0 -2.5 L600 -52 L600 52 L0 2.5 Z" fill="url(#sky-lhBeam)"></path></g>
<circle class="sky-flash" cx="0" cy="0" r="16" fill="#FFE9A8"></circle>
<circle cx="0" cy="0" r="4.5" fill="#FFF8D2"></circle>
</g>
</g>
</g>
<g class="sky-pz sky-pz4"><g transform="translate(720 0) scale(1.03 1) translate(-720 0)">
<g style="filter: brightness(var(--sk-lit, 1)) sepia(var(--sk-warm, 0)) hue-rotate(var(--sk-hue, 0deg)) saturate(var(--sk-sat, 1))">
<g mask="url(#sky-fade)" opacity="0.5"><g transform="translate(0 1424) scale(1 -1)" filter="url(#sky-ripple)">
<rect x="0" y="654" width="1440" height="58" fill="url(#sky-piers)"></rect>
<rect x="0" y="640" width="1440" height="14" fill="#D9D4C7"></rect>
<rect x="0" y="626" width="1440" height="12" fill="url(#sky-rails)"></rect>
<g class="sky-train"><g transform="translate(0 572)">
<rect x="0" y="0" width="190" height="60" rx="6" fill="#F5F7F8"></rect><rect x="2" y="46" width="186" height="9" fill="#1F5FAF"></rect><rect x="2" y="43" width="186" height="3" fill="#3BA55C"></rect><rect x="4" y="9" width="160" height="13" fill="url(#sky-cwin)"></rect><rect x="4" y="28" width="160" height="13" fill="url(#sky-cwin)"></rect>
<rect x="196" y="0" width="190" height="60" rx="6" fill="#F5F7F8"></rect><rect x="198" y="46" width="186" height="9" fill="#1F5FAF"></rect><rect x="198" y="43" width="186" height="3" fill="#3BA55C"></rect><rect x="200" y="9" width="160" height="13" fill="url(#sky-cwin)"></rect><rect x="200" y="28" width="160" height="13" fill="url(#sky-cwin)"></rect>
<rect x="392" y="0" width="190" height="60" rx="6" fill="#F5F7F8"></rect><rect x="394" y="46" width="186" height="9" fill="#1F5FAF"></rect><rect x="394" y="43" width="186" height="3" fill="#3BA55C"></rect><rect x="396" y="9" width="160" height="13" fill="url(#sky-cwin)"></rect><rect x="396" y="28" width="160" height="13" fill="url(#sky-cwin)"></rect>
<path d="M588 4 H706 L736 28 V60 H588 Z" fill="#F5F7F8"></path><rect x="590" y="46" width="145" height="9" fill="#1F5FAF"></rect><rect x="590" y="43" width="145" height="3" fill="#3BA55C"></rect>
</g></g>
</g></g>
<rect x="0" y="654" width="1440" height="58" fill="url(#sky-piers)"></rect>
<rect x="0" y="654" width="1440" height="6" fill="#8F897C"></rect>
<rect x="0" y="640" width="1440" height="14" fill="#D9D4C7"></rect>
<rect x="0" y="636" width="1440" height="4" fill="#3B3F48"></rect>
<rect x="0" y="624" width="1440" height="12" fill="url(#sky-rails)"></rect>
<rect x="0" y="622" width="1440" height="3" fill="#5A6270"></rect>
<g fill="#5A6270">
<rect x="118" y="586" width="4" height="38"></rect><rect x="112" y="582" width="16" height="5"></rect>
<rect x="358" y="586" width="4" height="38"></rect><rect x="352" y="582" width="16" height="5"></rect>
<rect x="598" y="586" width="4" height="38"></rect><rect x="592" y="582" width="16" height="5"></rect>
<rect x="838" y="586" width="4" height="38"></rect><rect x="832" y="582" width="16" height="5"></rect>
<rect x="1078" y="586" width="4" height="38"></rect><rect x="1072" y="582" width="16" height="5"></rect>
<rect x="1318" y="586" width="4" height="38"></rect><rect x="1312" y="582" width="16" height="5"></rect>
</g>
<g class="sky-train"><g transform="translate(0 572)">
<rect x="0" y="0" width="190" height="60" rx="6" fill="#F5F7F8" stroke="#24324A" stroke-width="2"></rect>
<rect x="6" y="-5" width="178" height="7" rx="3" fill="#C9CED3" stroke="#24324A" stroke-width="1.5"></rect>
<rect x="4" y="9" width="160" height="13" fill="url(#sky-cwin)"></rect><rect x="4" y="28" width="160" height="13" fill="url(#sky-cwin)"></rect>
<rect x="2" y="43" width="186" height="3" fill="#3BA55C"></rect><rect x="2" y="46" width="186" height="9" fill="#1F5FAF"></rect>
<rect x="168" y="10" width="16" height="44" fill="#DDE3E8" stroke="#24324A" stroke-width="1.2"></rect>
<rect x="16" y="58" width="32" height="6" rx="2" fill="#2E2E2E"></rect><rect x="142" y="58" width="32" height="6" rx="2" fill="#2E2E2E"></rect>
<circle cx="22" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="42" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="148" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="168" cy="64" r="4.5" fill="#1C1C1C"></circle>
<rect x="190" y="38" width="6" height="6" fill="#2E2E2E"></rect>
<rect x="196" y="0" width="190" height="60" rx="6" fill="#F5F7F8" stroke="#24324A" stroke-width="2"></rect>
<rect x="202" y="-5" width="178" height="7" rx="3" fill="#C9CED3" stroke="#24324A" stroke-width="1.5"></rect>
<rect x="200" y="9" width="160" height="13" fill="url(#sky-cwin)"></rect><rect x="200" y="28" width="160" height="13" fill="url(#sky-cwin)"></rect>
<rect x="198" y="43" width="186" height="3" fill="#3BA55C"></rect><rect x="198" y="46" width="186" height="9" fill="#1F5FAF"></rect>
<rect x="364" y="10" width="16" height="44" fill="#DDE3E8" stroke="#24324A" stroke-width="1.2"></rect>
<rect x="212" y="58" width="32" height="6" rx="2" fill="#2E2E2E"></rect><rect x="338" y="58" width="32" height="6" rx="2" fill="#2E2E2E"></rect>
<circle cx="218" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="238" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="344" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="364" cy="64" r="4.5" fill="#1C1C1C"></circle>
<rect x="386" y="38" width="6" height="6" fill="#2E2E2E"></rect>
<rect x="392" y="0" width="190" height="60" rx="6" fill="#F5F7F8" stroke="#24324A" stroke-width="2"></rect>
<rect x="398" y="-5" width="178" height="7" rx="3" fill="#C9CED3" stroke="#24324A" stroke-width="1.5"></rect>
<rect x="396" y="9" width="160" height="13" fill="url(#sky-cwin)"></rect><rect x="396" y="28" width="160" height="13" fill="url(#sky-cwin)"></rect>
<rect x="394" y="43" width="186" height="3" fill="#3BA55C"></rect><rect x="394" y="46" width="186" height="9" fill="#1F5FAF"></rect>
<rect x="560" y="10" width="16" height="44" fill="#DDE3E8" stroke="#24324A" stroke-width="1.2"></rect>
<rect x="408" y="58" width="32" height="6" rx="2" fill="#2E2E2E"></rect><rect x="534" y="58" width="32" height="6" rx="2" fill="#2E2E2E"></rect>
<circle cx="414" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="434" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="540" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="560" cy="64" r="4.5" fill="#1C1C1C"></circle>
<rect x="582" y="38" width="6" height="6" fill="#2E2E2E"></rect>
<path d="M588 4 H706 L736 28 V60 H588 Z" fill="#F5F7F8" stroke="#24324A" stroke-width="2" stroke-linejoin="round"></path>
<rect x="594" y="-1" width="104" height="7" rx="3" fill="#C9CED3" stroke="#24324A" stroke-width="1.5"></rect>
<path d="M700 10 H711 L729 26 H700 Z" fill="#2B3A4A"></path>
<rect x="602" y="14" width="80" height="20" fill="#E3E8EC"></rect><rect x="602" y="14" width="80" height="20" fill="url(#sky-grille)"></rect>
<text x="688" y="40" font-family="Silkscreen, monospace" font-size="10" fill="#24324A">805</text>
<rect x="590" y="43" width="145" height="3" fill="#3BA55C"></rect><rect x="590" y="46" width="145" height="9" fill="#1F5FAF"></rect>
<circle cx="731" cy="40" r="3.5" fill="#FFF3B0" stroke="#24324A" stroke-width="1"></circle>
<rect x="600" y="58" width="36" height="6" rx="2" fill="#2E2E2E"></rect><rect x="690" y="58" width="36" height="6" rx="2" fill="#2E2E2E"></rect>
<circle cx="607" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="629" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="697" cy="64" r="4.5" fill="#1C1C1C"></circle><circle cx="719" cy="64" r="4.5" fill="#1C1C1C"></circle>
</g></g>
</g>
<g style="opacity: var(--sk-glow, 0)">
<g fill="#FFDC8C" opacity="0.4"><circle cx="120" cy="586" r="16"></circle><circle cx="360" cy="586" r="16"></circle><circle cx="600" cy="586" r="16"></circle><circle cx="840" cy="586" r="16"></circle><circle cx="1080" cy="586" r="16"></circle><circle cx="1320" cy="586" r="16"></circle></g>
<g fill="#FFF3CC"><circle cx="120" cy="586" r="4"></circle><circle cx="360" cy="586" r="4"></circle><circle cx="600" cy="586" r="4"></circle><circle cx="840" cy="586" r="4"></circle><circle cx="1080" cy="586" r="4"></circle><circle cx="1320" cy="586" r="4"></circle></g>
<g class="sky-train"><g transform="translate(0 572)">
<rect x="4" y="9" width="160" height="13" fill="url(#sky-litc)"></rect><rect x="4" y="28" width="160" height="13" fill="url(#sky-litc)"></rect>
<rect x="200" y="9" width="160" height="13" fill="url(#sky-litc)"></rect><rect x="200" y="28" width="160" height="13" fill="url(#sky-litc)"></rect>
<rect x="396" y="9" width="160" height="13" fill="url(#sky-litc)"></rect><rect x="396" y="28" width="160" height="13" fill="url(#sky-litc)"></rect>
<path d="M700 10 H711 L729 26 H700 Z" fill="#FFE3A3"></path>
<path d="M735 40 L860 18 L860 62 Z" fill="#FFF0B4" opacity="0.35"></path>
<circle cx="731" cy="40" r="5" fill="#FFF8D2"></circle>
</g></g>
<g mask="url(#sky-fade)" opacity="0.6"><g transform="translate(0 1424) scale(1 -1)" filter="url(#sky-ripple)">
<g fill="#FFDC8C"><circle cx="120" cy="586" r="10"></circle><circle cx="360" cy="586" r="10"></circle><circle cx="600" cy="586" r="10"></circle><circle cx="840" cy="586" r="10"></circle><circle cx="1080" cy="586" r="10"></circle><circle cx="1320" cy="586" r="10"></circle></g>
<g class="sky-train"><g transform="translate(0 572)">
<rect x="4" y="9" width="160" height="13" fill="url(#sky-litc)"></rect><rect x="4" y="28" width="160" height="13" fill="url(#sky-litc)"></rect>
<rect x="200" y="9" width="160" height="13" fill="url(#sky-litc)"></rect><rect x="200" y="28" width="160" height="13" fill="url(#sky-litc)"></rect>
<rect x="396" y="9" width="160" height="13" fill="url(#sky-litc)"></rect><rect x="396" y="28" width="160" height="13" fill="url(#sky-litc)"></rect>
</g></g>
</g></g>
</g>
</g></g>
<g class="sky-pz sky-pz5"><g transform="translate(720 0) scale(1.04 1) translate(-720 0)">
<g class="sky-wash"><path d="M0 832 C240 814 520 838 820 824 C1080 812 1280 826 1440 818 L1440 840 L0 846 Z" style="fill: var(--sk-strip, #8BEAF3)" opacity="0.7"></path></g>
<path d="M0 1000 L0 840 C240 824 520 848 820 834 C1080 822 1280 836 1440 828 L1440 1000 Z" style="fill: var(--sk-sand, #F5F0E3)"></path>
<path d="M0 840 C240 824 520 848 820 834 C1080 822 1280 836 1440 828" fill="none" style="stroke: var(--sk-foam, #FFFFFF)" stroke-width="4" stroke-linecap="round"></path>
<g style="fill: var(--sk-sandShade, #DDD6C4)">
<path d="M0 852 C240 836 520 860 820 846 C1080 834 1280 848 1440 840 L1440 846 C1280 854 1080 840 820 852 C520 866 240 842 0 858 Z" opacity="0.7"></path>
<rect x="120" y="872" width="36" height="2" rx="1"></rect><rect x="300" y="884" width="24" height="2" rx="1"></rect><rect x="520" y="868" width="30" height="2" rx="1"></rect><rect x="760" y="880" width="40" height="2" rx="1"></rect><rect x="980" y="866" width="28" height="2" rx="1"></rect><rect x="1180" y="884" width="34" height="2" rx="1"></rect><rect x="1340" y="870" width="26" height="2" rx="1"></rect>
</g>
<g style="opacity: var(--sk-bio, 0)">
<path d="M0 840 C240 824 520 848 820 834 C1080 822 1280 836 1440 828" fill="none" stroke="#5CF2FF" stroke-width="8" stroke-linecap="round" opacity="0.7" filter="url(#sky-bioBlur)"></path>
<g fill="#A6FCFF">
<g class="sky-tw1"><circle cx="60" cy="834" r="2.6"></circle><circle cx="250" cy="826" r="2"></circle><circle cx="470" cy="834" r="3"></circle><circle cx="700" cy="833" r="2.2"></circle><circle cx="930" cy="824" r="2.8"></circle><circle cx="1150" cy="823" r="2"></circle><circle cx="1370" cy="826" r="2.6"></circle></g>
<g class="sky-tw2"><circle cx="150" cy="828" r="2"></circle><circle cx="360" cy="830" r="2.6"></circle><circle cx="590" cy="836" r="2"></circle><circle cx="820" cy="829" r="3"></circle><circle cx="1040" cy="822" r="2.2"></circle><circle cx="1260" cy="828" r="2.8"></circle></g>
<g class="sky-tw3"><circle cx="100" cy="820" r="1.6"></circle><circle cx="300" cy="816" r="1.8"></circle><circle cx="540" cy="824" r="1.6"></circle><circle cx="760" cy="820" r="1.8"></circle><circle cx="990" cy="812" r="1.6"></circle><circle cx="1210" cy="816" r="1.8"></circle><circle cx="1420" cy="814" r="1.6"></circle></g>
</g>
</g>
</g></g>
</svg>`;

const LAT = 25.79, LNG = -80.13, TZ = 'America/New_York'; // South Florida
const MIN = 60000, HOUR = 3600000, DAY = 86400000;
const PAL = {
    day:   { sky1: '#2C66B6', sky2: '#3F8BCB', sky3: '#BDEDE4', cloud: '#FBF7EA', shade: '#E4E6F4', back: '#CDEFEA', streak: '#2A5DAA', haze: '#FFFFFF', meteor: '#FFFFFF', wisp: '#E9F4FF', spark: '#FFFFFF', seaFar: '#0E86B4', seaNear: '#38C8E0', strip: '#8BEAF3', foam: '#FFFFFF', glint: '#FFFFFF', glintT: '#5FE3F4', sunC: '#FFF6D8', sand: '#F5F0E3', sandShade: '#DDD6C4' },
    dusk:  { sky1: '#5B3C93', sky2: '#C46A9E', sky3: '#FFD6B6', cloud: '#E7A2C2', shade: '#FFD3B4', back: '#C78CB9', streak: '#7A4C9C', haze: '#FFE3D0', meteor: '#FFE7DA', wisp: '#F7B6D2', spark: '#FFE7A6', seaFar: '#FFDCCF', seaNear: '#B4578F', strip: '#FFF0E6', foam: '#FFF4EE', glint: '#FFF1D8', glintT: '#FFE3EC', sunC: '#FFFCF4', sand: '#D8708F', sandShade: '#B5537A' },
    night: { sky1: '#0F1850', sky2: '#272C7A', sky3: '#6C5DB6', cloud: '#6E6FC6', shade: '#5051A6', back: '#4A4A9C', streak: '#7C7FD8', haze: '#9C8FE6', meteor: '#E6E4FF', wisp: '#B57BCB', spark: '#FFFFFF', seaFar: '#3C3E98', seaNear: '#111343', strip: '#6E6CC8', foam: '#B9B6FF', glint: '#EEF0FF', glintT: '#9E9CFF', sunC: '#FFFFFF', sand: '#3D3A86', sandShade: '#2C296C' }
};
const KEYS = Object.keys(PAL.day);
const toRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const RGB = {};
['day', 'dusk', 'night'].forEach(p => { RGB[p] = {}; KEYS.forEach(k => { RGB[p][k] = toRGB(PAL[p][k]); }); });
const MODES = [['live', 'Live'], ['fast', 'Fast'], ['day', 'Day'], ['sunset', 'Sunset'], ['night', 'Night']];
const PHASES = [[0.03, 'New moon'], [0.22, 'Waxing crescent moon'], [0.28, 'First quarter moon'], [0.47, 'Waxing gibbous moon'], [0.53, 'Full moon'], [0.72, 'Waning gibbous moon'], [0.78, 'Last quarter moon'], [0.97, 'Waning crescent moon'], [1.01, 'New moon']];
const FAST_DAY_SECONDS = 60; // Fast plays a whole day in a minute
const SLOTS = 6;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const phaseName = p => (PHASES.find(([end]) => p < end) || PHASES[0])[1];
// Lit part of a 26px moon with its bright edge facing +x: a half disc, then the terminator as a half ellipse
const moonPath = f => 'M0 -26 A26 26 0 0 1 0 26 A' + (26 * Math.abs(1 - 2 * f)).toFixed(2) + ' 26 0 0 ' + (f < 0.5 ? 0 : 1) + ' 0 -26 Z';
const motionQuery = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
const still = () => !!(motionQuery && motionQuery.matches);

let zoneFmt = null, clockFmt = null;
// Minutes the location's clocks run ahead of UTC at instant t
function zoneOffset(t) {
    try {
        zoneFmt = zoneFmt || new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        const p = {};
        zoneFmt.formatToParts(new Date(t)).forEach(x => { p[x.type] = Number(x.value); });
        return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute) - Math.floor(t / MIN) * MIN) / MIN);
    } catch (e) { return -new Date(t).getTimezoneOffset(); }
}
function clockText(t) {
    try {
        clockFmt = clockFmt || new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
        return clockFmt.format(new Date(t));
    } catch (e) { return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
}

const GRAIN = '<svg class="sky-grain" aria-hidden="true"><filter id="sky-grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"></feTurbulence><feColorMatrix type="matrix" values="0.5 0.5 0.5 0 -0.25  0.5 0.5 0.5 0 -0.25  0.5 0.5 0.5 0 -0.25  0 0 0 0 1"></feColorMatrix></filter><rect x="0" y="0" width="100%" height="100%" filter="url(#sky-grainF)"></rect></svg>';

const Sky = {
    root: null, mode: 'live', running: false, visible: true, raf: 0,
    zone: { at: -Infinity, off: 0 },

    // Draws the scene into About's .sky section once; later calls only re-measure
    mount(root) {
        if (!root) return;
        if (this.root === root) { this.size(); return; }
        this.root = root;
        root.querySelector('.sky-stage').innerHTML = SCENE + GRAIN;
        const shots = document.createElement('div');
        shots.className = 'sky-shots'; shots.setAttribute('aria-hidden', 'true');
        shots.innerHTML = '<span class="sky-shot"><span class="sky-shot-tail"></span><span class="sky-shot-head"></span></span>'.repeat(SLOTS);
        root.appendChild(shots);
        this.shots = Array.from(shots.children); this.nextShot = 0;
        const dock = root.querySelector('.sky-dock');
        dock.innerHTML = '<p class="sky-hint">Tap the sky to make a wish</p>'
            + '<p class="sky-readout" aria-live="off"></p>'
            + '<div class="sky-ctl" role="group" aria-label="Time of day"><span class="sky-ctl-l">Time</span>'
            + MODES.map(([id, label]) => '<button type="button" data-sky-mode="' + id + '" aria-pressed="' + (id === this.mode) + '">' + label + '</button>').join('') + '</div>';
        dock.hidden = false;
        this.readoutEl = dock.querySelector('.sky-readout');
        this.moonEl = root.querySelector('#sky-moonpath');
        this.moonKey = -1;
        dock.addEventListener('click', e => { const b = e.target.closest('[data-sky-mode]'); if (b) this.pick(b.dataset.skyMode); });
        root.addEventListener('click', e => this.tap(e));
        root.addEventListener('pointermove', e => this.lean(e));
        root.addEventListener('pointerleave', () => { root.style.setProperty('--sk-px', '0'); root.style.setProperty('--sk-py', '0'); });
        // Re-measure when the text changes size (fonts arriving, a new bio, a narrower window)
        if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => this.size()); ro.observe(root); ro.observe(root.querySelector('.sky-txt')); }
        else window.addEventListener('resize', () => this.size());
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => {
                this.visible = entries[0].isIntersecting;
                root.classList.toggle('is-paused', !this.visible);
                if (this.visible && this.running && !this.raf) this.kick();
            }).observe(root);
        }
        this.tShow = this.liveTime(Date.now());
        this.loop = this.loop.bind(this);
        this.size();
    },
    start() {
        if (!this.root || this.running) return;
        this.running = true;
        this.root.classList.remove('is-paused');
        this.size();
        this.kick();
    },
    stop() {
        this.running = false;
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = 0;
        if (this.root) this.root.classList.add('is-paused');
    },
    kick() { this.painted = -Infinity; this.last = 0; this.raf = requestAnimationFrame(this.loop); },

    // Tall enough that the text always sits in the sky, above the horizon
    size() {
        const txt = this.root && this.root.querySelector('.sky-txt');
        if (!txt) return;
        const w = this.root.clientWidth, tb = txt.offsetTop + txt.offsetHeight;
        let h;
        if (w < 600) h = tb + 140 + 284;                  // phone crop: open strip for the sun and moon, then sea and beach
        else { h = tb + 32 + 0.2625 * w; if (h > 0.625 * w) h = Math.max(h, (tb + 32) / 0.58); }
        this.root.style.setProperty('--sky-h', Math.ceil(h) + 'px');
    },

    // The instant when Florida's clocks read what the visitor's clock reads now: their time of day, this sky
    liveTime(now) {
        if (now - this.zone.at > 10 * MIN) this.zone = { at: now, off: zoneOffset(now) };
        return now + (-new Date(now).getTimezoneOffset() - this.zone.off) * MIN;
    },
    fixedTime(mode) {
        const base = this.liveTime(Date.now());
        const st = SunCalc.getTimes(new Date(base), LAT, LNG, 0, zoneOffset(base));
        if (mode === 'day') return +st.solarNoon + 1.5 * HOUR;
        if (mode === 'sunset') return +st.sunset - 10 * MIN;
        return +(st.dusk || st.sunset) + 3 * HOUR;
    },
    pick(id) {
        if (!MODES.some(m => m[0] === id)) return;
        if (id === 'fast') this.simT = this.tShow;
        else if (id !== 'live') {
            this.fixed = this.fixedTime(id);
            this.moonLift = id === 'night' && SunCalc.getMoonPosition(new Date(this.fixed), LAT, LNG).altitude < 12;
        }
        this.mode = id;
        this.root.querySelectorAll('[data-sky-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.skyMode === id)));
        this.painted = -Infinity;
    },

    loop(now) {
        if (!this.running || !this.visible) { this.raf = 0; return; }
        this.raf = requestAnimationFrame(this.loop);
        const dt = Math.min(0.1, (now - (this.last || now)) / 1000); this.last = now;
        const mode = this.mode;
        let target;
        if (mode === 'live') target = this.liveTime(Date.now());
        else if (mode === 'fast') { this.simT += dt * DAY / FAST_DAY_SECONDS; target = this.simT; }
        else target = this.fixed;
        // Glide between times (picking Day at night runs the sky back through the evening) instead of jumping
        const diff = target - this.tShow, settled = still() || Math.abs(diff) < MIN;
        this.tShow = settled ? target : this.tShow + diff * (1 - Math.exp(-dt * 2.6));
        if (now - this.painted < (settled && mode !== 'fast' ? 1000 : 40)) return;
        this.painted = now;
        this.paint(mode, target);
    },

    paint(mode, target) {
        const r = this.root.style, t = new Date(this.tShow);
        const set = (k, v) => r.setProperty('--sk-' + k, v);
        const sun = SunCalc.getPosition(t, LAT, LNG), moon = SunCalc.getMoonPosition(t, LAT, LNG), ill = SunCalc.getMoonIllumination(t);
        let mAlt = moon.altitude, mAz = moon.azimuth;
        if (mode === 'night' && this.moonLift) {
            // Night can land on a moonless hour; lift the moon (still its real phase) into view
            const k = 1 - smooth(0, 2 * HOUR, Math.abs(target - this.tShow));
            mAlt += (40 - mAlt) * k; mAz += (160 - mAz) * k;
        }
        const a = sun.altitude, f = ill.fraction;
        const wd = smooth(2, 14, a), wn = 1 - smooth(-14, -2, a), wt = Math.max(0, 1 - wd - wn);
        KEYS.forEach(k => {
            const d = RGB.day[k], s = RGB.dusk[k], n = RGB.night[k];
            set(k, 'rgb(' + [0, 1, 2].map(i => Math.round(d[i] * wd + s[i] * wt + n[i] * wn)).join(',') + ')');
        });
        // Looking south over the water: east on the left, west on the right, the horizon at y 522
        const P = this.root.clientWidth < 600 ? { cx: 1028, ax: 40, ay: 115 } : { cx: 1010, ax: 300, ay: 380 };
        const sx = P.cx + clamp((sun.azimuth - 180) / 92, -1, 1) * P.ax, sy = 522 - clamp(a / 70, -0.6, 1) * P.ay;
        const mx = P.cx + clamp((mAz - 180) / 92, -1, 1) * P.ax, my = 522 - clamp(mAlt / 70, -0.6, 1) * P.ay;
        const sunO = smooth(-5, 0.5, a), mUp = smooth(-2, 3, mAlt);
        const sunCol = sunO * (wd + wt * 0.8), moonCol = mUp * wn * (0.3 + 0.7 * f) * 0.9;
        set('sx', sx.toFixed(1) + 'px'); set('sy', sy.toFixed(1) + 'px'); set('sunO', sunO.toFixed(3));
        set('mx', mx.toFixed(1) + 'px'); set('my', my.toFixed(1) + 'px');
        set('moonO', (mUp * (1 - 0.5 * wd)).toFixed(3));
        set('mrot', (Math.atan2(sy - my, sx - mx) * 180 / Math.PI).toFixed(1) + 'deg'); // the bright edge faces the sun
        set('lx', (sunCol >= moonCol ? sx : mx).toFixed(1) + 'px');
        set('colO', Math.max(sunCol, moonCol).toFixed(3));
        set('hazeO', (wt * sunO).toFixed(3));
        set('raysO', (smooth(-3, 1, a) * (1 - smooth(6, 16, a)) * 0.9).toFixed(3));
        set('stars', (wn + wt * 0.6 + wd * 0.15).toFixed(3));
        set('bokeh', wn.toFixed(3));
        set('wispO', (wn * 0.85 + wt * 0.4).toFixed(3));
        set('streakO', (wd * 0.35 + wt * 0.15 + wn * 0.1).toFixed(3));
        set('meteorO', (wd * 0.3 + wt * 0.9 + wn * 0.55).toFixed(3));
        set('shootO', (wn + wt * 0.25).toFixed(3));
        set('auroraO', (wn * 0.55).toFixed(3));
        set('bio', wn.toFixed(3));
        set('birdsO', (wd + wt * 0.6).toFixed(3));
        set('beamO', Math.min(1, wn + wt * 0.5).toFixed(3));
        set('lit', (wd + wt * 0.7 + wn * 0.55).toFixed(3));
        set('warm', (wt * 0.5).toFixed(3));
        set('hue', (wt * -38).toFixed(1) + 'deg');
        set('sat', (wd + wt * 1.15 + wn * 0.8).toFixed(3));
        set('glow', Math.min(1, wn + wt * 0.35).toFixed(3));
        const pct = Math.round(f * 100);
        if (pct !== this.moonKey && this.moonEl) { this.moonKey = pct; this.moonEl.setAttribute('d', moonPath(f)); }
        const lit = mUp < 0.5 ? ', below the horizon' : f > 0.03 && f < 0.97 ? ', ' + pct + '% lit' : '';
        const text = clockText(mode === 'fast' ? Math.round(this.tShow / (10 * MIN)) * 10 * MIN : this.tShow) + ' · ' + phaseName(ill.phase) + lit;
        if (this.readoutEl && this.readoutEl.textContent !== text) this.readoutEl.textContent = text;
    },

    // Tap the sky for a shooting star
    tap(e) {
        if (e.target.closest && e.target.closest('a, button, .sky-dock')) return;
        const b = this.root.getBoundingClientRect();
        const x = e.clientX - b.left, y = e.clientY - b.top;
        // The horizon sits 378 drawing units above the picture's bottom; on a phone the picture hangs 70px lower
        const horizon = b.width < 600 ? b.height + 70 - 378 * 0.9375 : b.height - 378 * Math.max(b.width / 1440, b.height / 900);
        if (y > horizon - 12) return;
        const el = this.shots[this.nextShot++ % SLOTS];
        el.style.left = Math.round(x) + 'px'; el.style.top = Math.round(y) + 'px';
        el.style.animationName = el.style.animationName === 'sky-shotA' ? 'sky-shotB' : 'sky-shotA';
    },

    // A little depth as the mouse moves
    lean(e) {
        if (e.pointerType !== 'mouse' || still()) return;
        const b = this.root.getBoundingClientRect();
        this.root.style.setProperty('--sk-px', ((e.clientX - b.left) / b.width * 2 - 1).toFixed(3));
        this.root.style.setProperty('--sk-py', ((e.clientY - b.top) / b.height * 2 - 1).toFixed(3));
    }
};

window.NeergSky = Sky;
})();
