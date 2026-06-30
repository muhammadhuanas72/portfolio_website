export const portfolioData = {
  personalInfo: {
    name: "Muhammadhu Anas M",
    titles: [
      "Frontend Web Developer",
      "Web Developer",
      "UI/UX Enthusiast"
    ],
    introduction: "I build modern, responsive, and user-focused web applications while leveraging AI to accelerate development, improve productivity, and create innovative digital experiences.",
    avatar: "/profile_nobg.png",
    resumeUrl: "/Muhammadhu_Anas_Resume.pdf",
    socials: {
      email: "muhammadhuanas72@gmail.com",
      phone: "+91 98949 37405", // Placeholder numbers/details which user can edit
      linkedin: "https://www.linkedin.com/in/muhammadhu-anas-972a80339",
      github: "https://github.com/muhammadhuanas72",
      location: "Tamil Nadu, India"
    }
  },
  
  about: {
    summary: "A passionate developer combining modern frontend technologies with efficient development workflows to build highly performant, visually stunning, and user-friendly web solutions. I love bridging the gap between design and clean code, always striving for pixel-perfect implementation and premium interactive experiences.",
    careerObjective: "To secure a challenging role as a Frontend / Java Developer, leveraging my technical skills in modern web development, programming languages, and advanced productivity tools to deliver high-quality software solutions and drive business growth.",
    timeline: [
      {
        id: "edu-1",
        year: "2022 - 2026",
        title: "B.Tech CSE",
        institution: "B.S. Abdur Rahman Crescent Institute of Science and Technology",
        description: "Specialized in web development and core programming, building strong foundations in software engineering, frontend stacks, and database systems."
      },
      {
        id: "edu-2",
        year: "2022",
        title: "Higher Secondary Schooling",
        institution: "SRVS National Higher Secondary School",
        description: "Completed higher secondary education focusing on mathematics, science, and computer science courses."
      }
    ],
    passions: [
      {
        title: "Frontend Development",
        description: "Designing interfaces that are responsive, accessible, and delightful to interact with."
      },
      {
        title: "Modern UI Design",
        description: "Focusing on grid systems, custom typography, animations, and clean dark mode aesthetics."
      },
      {
        title: "AI-assisted Development",
        description: "Leveraging advanced AI models to prototype rapidly, test edge-cases, and optimize code efficiency."
      },
      {
        title: "Continuous Learning",
        description: "Constantly expanding my skillset to stay at the cutting edge of modern software developments."
      }
    ]
  },

  skills: {
    categories: [
      {
        id: "frontend",
        title: "Frontend Development",
        description: "Building responsive, modern, and interactive user interfaces.",
        items: [
          "HTML5",
          "CSS3",
          "JavaScript",
          "Bootstrap",
          "Tailwind CSS",
          "Responsive Design"
        ]
      },
      {
        id: "programming",
        title: "Programming & Databases",
        description: "Writing clean, optimized, and structured logic layers.",
        items: [
          "Java",
          "Python",
          "SQL",
          "C",
          "C++"
        ]
      },
      {
        id: "ai-dev",
        title: "AI-Assisted Development",
        description: "Integrating next-generation AI workflows directly into development pipelines.",
        items: [
          "Prompt Engineering",
          "AI-assisted Coding",
          "Debugging",
          "Rapid Prototyping",
          "UI Generation",
          "Code Optimization",
          "Productivity Enhancement",
          "Documentation Generation"
        ]
      },
      {
        id: "tools",
        title: "Tools & Ecosystem",
        description: "Managing projects, layouts, and design workflows.",
        items: [
          "Git",
          "GitHub",
          "VS Code",
          "Android Studio",
          "Figma"
        ]
      }
    ]
  },

  experience: [
    {
      id: "exp-1",
      role: "Web Development Intern",
      company: "Cognifyz Technologies",
      period: "Nov 2024 – Dec 2024",
      description: "Focused on designing, developing, and deploying modern web user interfaces using frontend tech stacks.",
      highlights: [
        "Developed fully responsive websites and user interfaces to match design mockups.",
        "Built reusable React-like components to maintain clean and scalable code architectures.",
        "Optimized website load times and asset loading to improve overall lighthouse audit scores.",
        "Collaborated on designing aesthetic layouts focused on premium UX standards."
      ]
    },
    {
      id: "exp-2",
      role: "Java Development Intern",
      company: "Cognifyz Technologies",
      period: "Jul 2025 – Aug 2025",
      description: "Focused on core programming, object-oriented application design, and database interaction.",
      highlights: [
        "Developed standalone Java applications leveraging robust OOP principles.",
        "Worked with SQL databases, writing complex queries, triggers, and schema migrations.",
        "Designed and built RESTful web APIs to connect application frontends to backing stores.",
        "Optimized application logic and performance of database transaction layers."
      ]
    }
  ],

  projects: [
    {
      id: "proj-1",
      title: "Portable Fitness Studio",
      subtitle: "Fullstack Booking Platform",
      image: "/portable_fitness.png",
      demoUrl: "https://portable-fitness-studio.onrender.com/",
      githubUrl: "https://github.com/muhammadhuanas72/portable_fitness_studio",
      tech: ["Node.js", "Express", "Python", "Supabase", "SQLite", "Razorpay API", "HTML5", "CSS3", "JavaScript"],
      features: [
        "Interactive room and trainer reservation scheduling.",
        "Real-time backend transaction recording in SQLite and Supabase.",
        "Automated Excel-compatible CSV booking report exports for admins.",
        "Integrated Razorpay checkout workflow for secure customer payment."
      ],
      challenges: [
        "Data persistence & reporting: Configured structured schema synchronization with SQLite and automated CSV export pipelines.",
        "Payment signature validation: Implemented cryptographic verification of Razorpay webhooks and order responses."
      ],
      details: "A fullstack fitness booking platform featuring a hybrid Node.js and Python backend, integrated with Supabase and SQLite databases for client details. Supports Razorpay payment gateway integration, automatic CSV exports, and dynamic scheduling."
    },
    {
      id: "proj-2",
      title: "Auto Spare Parts E-Commerce",
      subtitle: "E-Commerce Frontend Website",
      image: "/spare_parts.png",
      demoUrl: "https://ecomautospares.netlify.app",
      githubUrl: "https://github.com/muhammadhuanas72/AutoSpares_website",
      tech: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
      features: [
        "Multi-page navigation (Home, Shop, Blog, Cart, and Product Details).",
        "Clean, modern storefront styling using custom, vanilla CSS layouts.",
        "Highly responsive visual grids tailored for mobile and desktop viewports.",
        "Interactive client-side shopping cart drawer operations."
      ],
      challenges: [
        "Optimizing layouts across dynamic screen sizes without framework assistance: Utilized pure CSS media queries, flexboxes, and custom aspect ratios.",
        "Organizing multiple page templates: Structured layouts cleanly using standard semantic HTML5 tags and descriptive CSS selectors."
      ],
      details: "A multi-page responsive e-commerce web application displaying product details, a custom shopping cart, blog, and category listings. Styled cleanly with custom CSS and structured using semantic HTML5."
    },
    {
      id: "proj-3",
      title: "Object Detection System",
      subtitle: "Computer Vision Web App",
      image: "/object_detection.png",
      demoUrl: "https://object-detection-cv-2834.onrender.com/",
      githubUrl: "https://github.com/muhammadhuanas72/object_detection_cv",
      tech: ["Python", "OpenCV", "Flask", "Docker", "HTML5", "CSS3", "JavaScript"],
      features: [
        "Real-time computer vision frame processing with OpenCV models.",
        "Flask web server routing and serving interactive stream endpoints.",
        "Fully containerized deployment setup using custom Docker configurations.",
        "Production-ready runtime setup configured with Procfile and Gunicorn."
      ],
      challenges: [
        "Streaming OpenCV video frames efficiently to browser endpoints: Constructed a Flask multipart MJPEG generator route, yielding consistent frame rates.",
        "Ensuring identical dev and production runtime environments: Built a lightweight Dockerfile and configured dependencies in requirements.txt."
      ],
      details: "A computer vision application integrating a Flask web server and OpenCV object detection engine. Fully containerized using Docker and configured for deployment via Gunicorn and Procfiles."
    }
  ],

  aiWorkflow: {
    description: "Instead of treating AI as a replacement for software engineering, I embrace it as a powerful co-developer and accelerator. This hybrid workflow enables me to build higher-quality applications, iterate designs rapidly, and focus on solving core architectural problems.",
    cards: [
      {
        title: "Rapid Prototyping",
        description: "Translating wireframe concepts into fully functional responsive interactive layouts in a fraction of the time."
      },
      {
        title: "Code Optimization",
        description: "Leveraging LLMs to refactor code blocks, optimize algorithms, and improve code structures for better performance."
      },
      {
        title: "Debugging & Edge Cases",
        description: "Quickly analyzing complex stack traces and generating test coverage matrices to uncover obscure edge cases."
      },
      {
        title: "Clean Documentation",
        description: "Automatically generating clear JSDoc annotations, markdown readmes, and inline comments to guarantee future maintainability."
      }
    ]
  },

  certifications: [
    {
      id: "cert-1",
      title: "Data Analytics Virtual Experience",
      issuer: "Deloitte",
      date: "2024",
      link: "#",
      description: "Gained insights into data analysis methodologies, dashboard design, and translating analytical findings into strategic recommendations."
    },
    {
      id: "cert-2",
      title: "Data Analysis and Visualisation",
      issuer: "Deloitte / Forage",
      date: "2024",
      link: "#",
      description: "Focused on cleaning complex datasets, building interactive data dashboards, and presenting insights to executive stakeholders."
    },
    {
      id: "cert-3",
      title: "Data Visualization Virtual Internship",
      issuer: "Tata / Forage",
      date: "2024",
      link: "#",
      description: "Learned key principles of visual story-telling, data dashboard layouts, and configuring intuitive charts for business intelligence."
    },
    {
      id: "cert-4",
      title: "Ignite India Certification",
      issuer: "Ignite India Program",
      date: "2023",
      link: "#",
      description: "Recognized for problem-solving, collaborative product engineering, and prototyping innovative technology concepts."
    },
    {
      id: "cert-5",
      title: "Object Detection & Computer Vision",
      issuer: "Cognizant / Academic Program", // Placeholder issuer
      date: "2023",
      link: "#",
      description: "Mastered fundamental OpenCV techniques, image processing filters, convolutional networks, and live feed object boundary mapping."
    }
  ],

  achievements: [],
  awards: [],
  blogs: [],
  testimonials: [],
  freelanceWork: []
};
