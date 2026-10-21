import projects from "./projects.json";

export const portfolioData = {
  personalInfo: {
    name: "Muhammadhu Anas M",
    titles: [
      "Frontend Web Developer",
      "Data Analyst",
      "UI/UX Enthusiast"
    ],
    introduction: "I build modern, responsive, and user-focused web applications while leveraging AI to accelerate development, improve productivity, and create innovative digital experiences.",
    avatar: "/media/hero-illustration-wide.webp",
    // Default resumes. The owner can replace these from /admin.html once Supabase is configured.
    resumes: [
      { slug: "software-dev", label: "Software Developer", url: "/resume/Anas_resume_software_dev.pdf" },
      { slug: "data-analyst", label: "Data Analyst", url: "/resume/Anas_resume_data_analyst.pdf" }
    ],
    socials: {
      email: "muhammadhuanas72@gmail.com",
      phone: "+91 98949 37405",
      linkedin: "https://www.linkedin.com/in/muhammadhu-anas-972a80339",
      github: "https://github.com/muhammadhuanas72",
      location: "Chennai, Tamil Nadu"
    }
  },
  
  about: {
    summary: "A passionate developer combining modern frontend technologies with efficient development workflows to build highly performant, visually stunning, and user-friendly web solutions. I love bridging the gap between design and clean code, always striving for pixel-perfect implementation and premium interactive experiences.",
    analystSummary: "Computer Science Engineering student with practical expertise in SQL, Python, Power BI, and Advanced Excel. Experienced in relational database querying, data modeling, and performance reporting developed through technical internships, academic projects, and industry job simulations. Adept at building interactive dashboards, standardizing unstructured datasets, and translating transactional data into actionable business intelligence.",
    careerObjective: "To secure a challenging role as a Frontend / Java Developer, leveraging my technical skills in modern web development, programming languages, and advanced productivity tools to deliver high-quality software solutions and drive business growth.",
    timeline: [
      {
        id: "edu-1",
        year: "Sep 2022 – May 2026",
        title: "B.Tech CSE",
        degree: "B.Tech Computer Science Engineering",
        cgpa: "7.71",
        institution: "B.S. Abdur Rahman Crescent Institute of Science and Technology",
        location: "Chennai, India",
        description: "Specialized in web development and core programming, building strong foundations in software engineering, frontend stacks, and database systems. CGPA 7.71."
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
          "React.js",
          "Bootstrap",
          "Tailwind CSS",
          "Responsive Design",
          "Wireframing",
          "Prototyping"
        ]
      },
      {
        id: "data",
        title: "Data Analysis & BI",
        description: "Querying, modeling, and turning transactional data into dashboards and decisions.",
        items: [
          "SQL (MySQL)",
          "Joins, Subqueries, CTEs",
          "Relational Design (3NF)",
          "Power BI",
          "Power Query",
          "DAX Measures",
          "Star Schema",
          "Excel (Pivot Tables, XLOOKUP)",
          "Data Cleaning",
          "Pandas",
          "NumPy"
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
          "JavaScript",
          "C",
          "C++",
          "DBMS",
          "Data Structures",
          "OOP"
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
          "MySQL Workbench"
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
      location: "Remote",
      description: "Focused on designing, developing, and deploying modern web user interfaces using frontend tech stacks.",
      highlights: [
        "Developed responsive websites using HTML, CSS, and JavaScript.",
        "Built interactive UI components and improved website usability and performance.",
        "Developed interactive front-end components and data-driven dashboards using JavaScript, HTML5, and CSS3.",
        "Integrated front-end forms with backend data endpoints, ensuring seamless data capture and input validation."
      ]
    },
    {
      id: "exp-2",
      role: "Java Development Intern",
      company: "Cognifyz Technologies",
      period: "Jul 2025 – Aug 2025",
      location: "Remote",
      description: "Focused on core programming, object-oriented application design, and database interaction.",
      highlights: [
        "Developed Java-based application functionalities and worked with SQL databases.",
        "Engineered and tested SQL queries across relational database tables to support backend application data flow.",
        "Developed and validated REST APIs for structured JSON retrieval, ensuring reliable data extraction and integrity.",
        "Analyzed query performance bottlenecks and optimized indexing strategies to enhance data retrieval speeds."
      ]
    }
  ],

  // Projects live in projects.json so `npm run add-project` can append to them.
  projects,

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
      issuer: "Deloitte · Forage",
      date: "2024",
      link: "#",
      description: "Gained insights into data analysis methodologies, dashboard design, and translating analytical findings into strategic recommendations."
    },
    {
      id: "cert-2",
      title: "Data Analysis and Visualisation",
      issuer: "Deloitte · Forage",
      date: "2024",
      link: "#",
      description: "Focused on cleaning complex datasets, building interactive data dashboards, and presenting insights to executive stakeholders."
    },
    {
      id: "cert-3",
      title: "Data Visualization Virtual Internship",
      issuer: "Tata · Forage",
      date: "2024",
      link: "#",
      description: "Learned key principles of visual story-telling, data dashboard layouts, and configuring intuitive charts for business intelligence."
    },
    {
      id: "cert-4",
      title: "Ignite India Certification",
      issuer: "Wadhwani",
      date: "2023",
      link: "#",
      description: "Recognized for problem-solving, collaborative product engineering, and prototyping innovative technology concepts."
    },
    {
      id: "cert-5",
      title: "Object Detection & Computer Vision",
      issuer: "Cognitive Class",
      date: "2023",
      link: "#",
      description: "Mastered fundamental OpenCV techniques, image processing filters, convolutional networks, and live feed object boundary mapping."
    },
    {
      id: "cert-6",
      title: "30 Days Power BI Micro Course",
      issuer: "SkillCourse",
      date: null,
      link: "#",
      description: null
    },
    {
      id: "cert-7",
      title: "Deloitte Technology Simulation",
      issuer: "Forage",
      date: null,
      link: "#",
      description: null
    }
  ],

  achievements: [],
  awards: [],
  blogs: [],
  testimonials: [],
  freelanceWork: []
};
