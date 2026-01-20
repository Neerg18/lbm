# **LBM (Leaflet Blog Manager)**

Welcome\! **LBM** is a little system that allows you to run a (somewhat) dynamic micro-blog (like Twitter, or a lil’ diary) on static hosting sites like [**Neocities**](https://neocities.org) without needing to know how to code.

# Setup Guide
This assumes you have **zero** coding experience, but that you have signed up to Neocities. Follow these steps exactly, and you should have your site running in about 10 minutes.

## **Phase 1: Creating the Brain (Firebase)**

Since Neocities doesn't have a database (it only stores files), we need a free external "brain" to remember your posts, comments, and likes. We use **Google Firebase** for this, since it’s free and industry standard.

1. Go to the [Firebase Console](https://console.firebase.google.com/).  
2. Log in with your Google account.  
3. Click **"Add project"** (or "Create a project").  
4. **Name it:** Call it whatever you want (e.g., `my-blog-db`).  
5. It will show you a bunch of AI integration and Google Analytics stuff, just turn all of those **OFF** (toggle the switch). It makes the setup simpler, and is not needed.  
6. Click **"Create Project"**.  
7. Wait for it to finish, then click **"Continue"**.

### **Setting up the Database**

1. On the left sidebar, click **Build**, then click **Firestore Database**.  
2. Click the button **"Create database"**.  
3. **Location:** Keep the default setting (usually nam5 or us-central). Click **Next**.  
4. **Security Rules:** Select **"Start in test mode"**. Click **Enable**.

### **IMPORTANT: Fixing the Rules**

"Test mode" only lasts 30 days. To make your blog work forever:

1. In your new database, click the **"Rules"** tab at the top.  
2. Delete *everything* in the code box.

3. Paste exactly this code instead:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read posts
    match /posts/{postId} {
      allow read: if true;
      
      // Allow creating new posts
      allow create: if request.resource.data.keys().hasAll(['content', 'date']);
      
      // Allow updates (for likes/comments) only if the structure remains valid
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasAny(['likes', 'dislikes', 'comments']);
      
      // Allow deleting
      allow delete: if true; 
    }
  }
}
```

4. Click **Publish**.

### **Getting your Keys**

1. Click the **Gear Icon** (Project Settings) at the very top left of the sidebar.  
2. Scroll down to the "Your apps" section.  
3. Click the **\</\>** icon (Web).  
4. **App nickname:** Enter anything (e.g., "Blog"). Click **Register app**.  
5. **Copy the Code:** You will see a box with code that looks like `const firebaseConfig = { ... };`  
6. **Copy everything inside that box.** Save it in a Notepad file on your computer for the next step.

## **Phase 2: Generating Your Site**

Now we will create a secure configuration file that connects your site to that database.

1. Make sure you have the **index.html** and **style.css** files provided with this system in a folder on your computer.  
2. **Double-click index.html** to open it in your browser (Chrome, Firefox, etc.).  
3. You will see a Setup Wizard screen called **"SYSTEM BOOT // INITIAL SETUP"**.

### **Filling out the Setup Wizard**

1. **Firebase Config:** Paste the code you copied from Phase 1 into the big text box.  
2. **Password:** Create a password. You will need this to log into your site's admin panel to make posts.  
3. **Site Identity:** Fill out your Site Name, What to call Leaflets, etc.  
4. **Theme:** Click the colored boxes to pick your colors.  
   * *Tip: You can use a direct image link in "Global Background Image" to set a wallpaper.*  
5. **Reactions:** You can choose between Faces (＾∇＾), Thumbs 👍, or Arrows ⬆.

### **Downloading the System File**

1. When you are happy with how it looks, click the big button: **"GENERATE system.js"**.  
2. Your browser will download a file named `system.js`.  
   * *Note: Your browser might warn you about this file type. It is safe to keep, it just generates an encrypted config file for your site to use.*  
3. **Move this file** into the same folder as your index.html and style.css.

## **Phase 3: Going Live on Neocities**

Now we put it on the internet.

1. Log into your [Neocities Dashboard](https://neocities.org/dashboard).  
2. **Upload Files:** Drag and drop these 3 files onto the dashboard:  
   * `index.html`  
   * `style.css`  
   * `system.js`  
3. **Create Image Folder:**  
   * Click "New Folder".  
   * Name it exactly: **img** (lowercase).  
   * Go into that folder and upload any images, videos, or profile pictures you want to use.

**That's it\!** Click your site link (e.g., yoursite.neocities.org) and you will see your blog.

## **Phase 4: How to Post & Manage**

1. Go to your live site.  
2. Click **"Login"** in the sidebar.  
3. Enter the password you created in Phase 2\.  
4. Once logged in, you will see the **Admin Dashboard**.

### **Writing a Post**

* **Text:** You can type regular text. You can also use **Markdown** to format it:  
  * \*\*bold text\*\* makes **bold text**.  
  * \*italic text\* makes *italic text*.  
  * \[Link Name\](https://google.com) makes a link.  
  * \- List item makes a bullet list.  
* **Images/Video:**  
  1. First, manually upload your file (e.g., cat.jpg) to the img folder on your Neocities dashboard.  
  2. In your site's Admin Panel, click "Choose File" and select that same cat.jpg from your computer (or just type in the image path below).  
  3. The system will automatically write the correct path (img/cat.jpg) for you.  
* Click **"Post to Database"**. It will appear instantly\!

### **Deleting a Post**

1. Log in to the Admin Panel.  
2. Go to the "Leaflets" (feed) tab.  
3. You will see a small **\[x\] Delete** button on the top right of every post. Click it to remove the post forever.

### **Changing Colors Later**

1. Log in to the Admin Panel.  
2. Click the **"Site Settings"** button at the top of the dashboard.  
3. Change your colors, names, or toggle comments on/off.  
4. Click **"Export New Configuration"**.  
5. It will download a *new* `system.js`.  
6. Go to Neocities and **upload the new system.js**, replacing the old one. Your site is now updated\!
