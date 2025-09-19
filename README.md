# 🚀 Internship Portal

A modern, responsive internship portal built with Next.js and Tailwind CSS where students can discover and apply for internship opportunities.

## ✨ Features

- **Beautiful Landing Page** - Modern design with gradient backgrounds and smooth animations
- **Student Dashboard** - Browse internships with search and filter functionality
- **Responsive Design** - Works perfectly on all devices
- **Modern UI/UX** - Built with Tailwind CSS for a polished look

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.6
- **Styling**: Tailwind CSS 4
- **Language**: JavaScript (React)
- **Package Manager**: npm

## 🚀 How to Run This Project

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Step 1: Open in VS Code
1. Open VS Code
2. Go to `File` → `Open Folder`
3. Navigate to your project folder: `C:\Users\Preshit\Desktop\Student_page\internship-portal`
4. Click `Select Folder`

### Step 2: Install Dependencies
Open the integrated terminal in VS Code:
- Press `Ctrl + `` (backtick) to open terminal
- Or go to `Terminal` → `New Terminal`

Then run:
```bash
npm install
```

### Step 3: Start Development Server
In the terminal, run:
```bash
npm run dev
```

### Step 4: Open in Browser
- The app will start at: `http://localhost:3000`
- Open your browser and navigate to the URL
- You should see the beautiful landing page!

## 📁 Project Structure

```
internship-portal/
├── src/
│   ├── app/
│   │   ├── page.js          # Landing page
│   │   ├── student/
│   │   │   └── page.js      # Student dashboard
│   │   ├── layout.js        # Root layout
│   │   └── globals.css      # Global styles
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 What You'll See

1. **Landing Page** (`/`): Beautiful homepage with options for students and companies
2. **Student Dashboard** (`/student`): Browse internships with search functionality
3. **Responsive Design**: Works on desktop, tablet, and mobile

## 🔧 Troubleshooting

### If you get "Missing script: dev" error:
- Make sure you're in the correct directory (`internship-portal`)
- Run `npm install` first
- Check that `package.json` exists and has the scripts section

### If port 3000 is busy:
- The terminal will show you an alternative port
- Or manually change it in `package.json` scripts

## 🎨 Customization

- **Colors**: Modify `globals.css` or use Tailwind classes
- **Content**: Edit the internship data in `student/page.js`
- **Styling**: Use Tailwind CSS classes for quick styling

## 📱 Mobile Responsive

The app is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Next Steps

- Add more internship listings
- Implement application functionality
- Add company portal
- Add user authentication
- Add database integration

---

**Happy Coding! 🎉**
