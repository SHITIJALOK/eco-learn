// Course content data with units, chapters, and quiz questions
const courseData = [
  {
    id: 1,
    title: "Green Methodologies",
    description: "Learn about sustainable practices and green development approaches",
    chapters: [
      {
        id: 1,
        title: "Introduction to Green Methodologies",
        content: [
          {
            type: "text",
            data: "Green methodologies are sustainable approaches to development and production that minimize environmental impact. These practices aim to reduce waste, conserve natural resources, and limit pollution. By adopting green methodologies, organizations can contribute to environmental preservation while often reducing costs and improving efficiency."
          },
          {
            type: "image",
            src: "/images/Organic-farming.jpg",
            alt: "Green methodology diagram",
            caption: "Organic farming - an example of green methodologies"
          },
          {
            type: "text",
            data: "Key principles of green methodologies include resource efficiency, waste reduction, pollution prevention, and biodiversity protection. These principles can be applied across various sectors including manufacturing, construction, agriculture, and information technology."
          },
          {
            type: "text",
            data: "Resource efficiency involves optimizing the use of energy, water, and materials to achieve more with less. This can be achieved through technologies like energy-efficient appliances, water-conserving fixtures, and processes that minimize material waste."
          },
          {
            type: "image",
            src: "/images/solar-panels.jpg",
            alt: "Renewable energy",
            caption: "Solar panels as an example of resource-efficient technology"
          },
          {
            type: "text",
            data: "Waste reduction strategies include recycling, composting, and designing products for longevity and reuse. The concept of 'circular economy' is central to waste reduction, where materials are kept in use for as long as possible through recycling and repurposing."
          },
          {
            type: "text",
            data: "Pollution prevention focuses on avoiding the creation of pollutants rather than cleaning them up after they are produced. This can involve using less toxic materials, improving process efficiency, and implementing cleaner production techniques."
          },
          {
            type: "image",
            src: "/images/clean-factory.jpg",
            alt: "Clean production",
            caption: "Modern factory implementing clean production techniques"
          },
          {
            type: "text",
            data: "Biodiversity protection involves preserving natural habitats, protecting endangered species, and maintaining ecosystem services. Green methodologies recognize that healthy ecosystems provide essential services like clean air, water filtration, and climate regulation."
          },
          {
            type: "resources",
            links: [
              {
                title: "EPA: Green Engineering",
                url: "https://www.epa.gov/green-engineering"
              },
              {
                title: "Circular Economy Principles - Ellen MacArthur Foundation",
                url: "https://ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview"
              },
              {
                title: "Introduction to Green Methods (Video)",
                url: "https://www.youtube.com/watch?v=B-QIlHXIHUI"
              }
            ]
          }
        ]
      },
      {
        id: 2,
        title: "Sustainable Materials and Design",
        content: [
          {
            type: "text",
            data: "Sustainable materials are those that have minimal negative impact on the environment during their extraction, production, use, and disposal. These materials are often renewable, biodegradable, recyclable, or have other environmentally beneficial properties."
          },
          {
            type: "image",
            src: "/images/sustainable-materials.jpg",
            alt: "Sustainable materials",
            caption: "Various sustainable materials used in modern construction"
          },
          {
            type: "text",
            data: "Sustainable design integrates these materials with approaches that minimize environmental impact throughout a product's lifecycle. This includes considerations for energy efficiency, water conservation, waste reduction, and the overall carbon footprint of the design."
          }
        ]
      },
      {
        id: 3,
        title: "Green Building Practices",
        content: [
          {
            type: "text",
            data: "Green building refers to the practice of creating structures that are environmentally responsible and resource-efficient throughout a building's life cycle. These practices extend from planning to design, construction, operation, maintenance, renovation, and demolition."
          },
          {
            type: "image",
            src: "/images/green-building.jpg",
            alt: "Green building",
            caption: "Modern green building with solar panels and vertical gardens"
          },
          {
            type: "text",
            data: "Key elements of green building include energy efficiency through proper insulation and renewable energy sources, water efficiency through rainwater harvesting and greywater recycling, sustainable material usage, and indoor environmental quality management for occupant health and comfort."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Clean Development Mechanisms",
    description: "Understand the frameworks for emission reduction and sustainable development",
    chapters: [
      {
        id: 1,
        title: "Introduction to CDM",
        content: [
          {
            type: "text",
            data: "Clean Development Mechanism (CDM) is a framework established under the Kyoto Protocol that allows a country with an emission-reduction commitment to implement an emission-reduction project in developing countries. These projects earn saleable certified emission reduction (CER) credits, each equivalent to one tonne of CO2."
          },
          {
            type: "image",
            src: "/images/wind-turbines.jpg",
            alt: "CDM project",
            caption: "A clean development mechanism project featuring wind turbines"
          },
          {
            type: "text",
            data: "The CDM is designed to meet two objectives: to help developed countries fulfill their emission reduction commitments, and to assist developing countries in achieving sustainable development while contributing to the ultimate objective of the UNFCCC (United Nations Framework Convention on Climate Change)."
          }
        ]
      },
      {
        id: 2,
        title: "Carbon Credits and Trading",
        content: [
          {
            type: "text",
            data: "Carbon credits are permits that allow the holder to emit a specified amount of carbon dioxide or other greenhouse gases. One credit permits the emission of one tonne of carbon dioxide or equivalent greenhouse gases."
          },
          {
            type: "image",
            src: "/images/carbon-trading.jpg",
            alt: "Carbon trading",
            caption: "Conceptual image of carbon credit trading and markets"
          },
          {
            type: "text",
            data: "Carbon trading is the process of buying and selling carbon credits. Companies or nations that exceed their permitted carbon emissions can purchase carbon credits from those who have reduced their emissions below their allocated level. This market-based approach aims to reduce overall carbon emissions while providing economic incentives for emission reduction."
          }
        ]
      },
      {
        id: 3,
        title: "CDM Project Implementation",
        content: [
          {
            type: "text",
            data: "Implementing a Clean Development Mechanism (CDM) project involves several key steps. The process begins with project design and development, followed by validation by a designated operational entity (DOE), registration with the CDM Executive Board, monitoring according to the approved methodology, verification by another DOE, and finally the issuance of certified emission reductions (CERs)."
          },
          {
            type: "image",
            src: "/images/cdm-implementation.jpg",
            alt: "CDM project cycle",
            caption: "The cycle of implementation for Clean Development Mechanism projects"
          },
          {
            type: "text",
            data: "Successful CDM projects must demonstrate additionality, meaning they would not have occurred without the CDM, and must contribute to sustainable development in the host country. Common types of CDM projects include renewable energy installations, energy efficiency improvements, waste management, and reforestation initiatives."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Environmental Impact Assessment",
    description: "Learn about the process of evaluating environmental consequences of proposed actions",
    chapters: [
      {
        id: 1,
        title: "Fundamentals of EIA",
        content: [
          {
            type: "text",
            data: "Environmental Impact Assessment (EIA) is a process of evaluating the likely environmental impacts of a proposed project or development, taking into account inter-related socio-economic, cultural and human-health impacts, both beneficial and adverse."
          },
          {
            type: "image",
            src: "/images/eia-process.jpg",
            alt: "EIA process",
            caption: "Overview of the Environmental Impact Assessment process"
          },
          {
            type: "text",
            data: "The primary purpose of the EIA is to ensure that decision-makers consider the environmental impacts when deciding whether to proceed with a project. EIA is used as a tool for planning and decision-making, helping to identify potential issues early and allow for mitigation measures to be incorporated into project design."
          }
        ]
      },
      {
        id: 2,
        title: "EIA Methodology",
        content: [
          {
            type: "text",
            data: "The methodology for conducting an Environmental Impact Assessment typically includes screening, scoping, impact analysis, mitigation measures, reporting, review of the EIA report, decision-making, and monitoring, compliance, enforcement and environmental auditing."
          },
          {
            type: "image",
            src: "/images/eia-methodology.jpg",
            alt: "EIA methodology",
            caption: "Different methodologies used in Environmental Impact Assessment"
          },
          {
            type: "text",
            data: "Various tools and techniques are employed in EIA, including checklists, matrices, networks, overlays, and computer expert systems. The selection of methods depends on the nature and scope of the project, the types of alternatives being considered, the nature of the likely impacts, the availability of resources, and the experience of the EIA team."
          }
        ]
      },
      {
        id: 3,
        title: "EIA Case Studies",
        content: [
          {
            type: "text",
            data: "Examining case studies of Environmental Impact Assessments provides valuable insights into the practical application of EIA methodologies and the effectiveness of mitigation measures. These real-world examples help illustrate both successful practices and common challenges encountered during the EIA process."
          },
          {
            type: "image",
            src: "/images/env-mitigation.jpg",
            alt: "EIA case study",
            caption: "Implementation of environmental mitigation measures at a development site"
          },
          {
            type: "text",
            data: "Case studies often reveal that the most effective EIAs involve early stakeholder engagement, thorough baseline data collection, comprehensive impact analysis, and robust monitoring plans. They also highlight the importance of adaptive management approaches that allow for modifications based on monitoring results and changing conditions."
          }
        ]
      }
    ]
  }
];

// Quiz questions for each chapter
const quizQuestions = {
  "1-1": [
    {
      question: "What is the primary goal of green methodologies?",
      options: [
        "To increase profitability at any environmental cost",
        "To minimize environmental impact while maintaining development",
        "To completely halt all industrial production",
        "To focus exclusively on recycling efforts"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of these is NOT a key principle of green methodologies?",
      options: [
        "Resource efficiency",
        "Waste reduction",
        "Maximum resource extraction",
        "Pollution prevention"
      ],
      correctAnswer: 2
    },
    {
      question: "Green methodologies can be applied to which sectors?",
      options: [
        "Only manufacturing",
        "Only agriculture",
        "Only information technology",
        "Multiple sectors including manufacturing, construction, and agriculture"
      ],
      correctAnswer: 3
    },
    {
      question: "What benefit can organizations often achieve by adopting green methodologies?",
      options: [
        "Reduced costs and improved efficiency",
        "Increased waste production",
        "Higher resource consumption",
        "Decreased product quality"
      ],
      correctAnswer: 0
    },
    {
      question: "Which of the following best describes a circular economy approach?",
      options: [
        "A linear production model focused on disposal",
        "A system where resources are used once and discarded",
        "A regenerative system that minimizes waste and resource inputs",
        "An approach that prioritizes profit over environmental concerns"
      ],
      correctAnswer: 2
    }
  ],
  "1-2": [
    {
      question: "What are sustainable materials characterized by?",
      options: [
        "High environmental impact during extraction",
        "Limited availability and non-renewability",
        "Minimal negative impact on the environment throughout their lifecycle",
        "Inability to be recycled or reused"
      ],
      correctAnswer: 2
    },
    {
      question: "Which property is NOT typically associated with sustainable materials?",
      options: [
        "Renewable",
        "Biodegradable",
        "Highly toxic",
        "Recyclable"
      ],
      correctAnswer: 2
    },
    {
      question: "What does sustainable design consider throughout a product's lifecycle?",
      options: [
        "Only the manufacturing phase",
        "Only the disposal phase",
        "Only the usage phase",
        "All phases from manufacturing to disposal"
      ],
      correctAnswer: 3
    },
    {
      question: "Which of these is a consideration in sustainable design?",
      options: [
        "Maximizing energy consumption",
        "Water conservation",
        "Increasing waste production",
        "Expanding the carbon footprint"
      ],
      correctAnswer: 1
    },
    {
      question: "Why is it important to consider a product's entire lifecycle in sustainable design?",
      options: [
        "To focus only on the manufacturing costs",
        "To identify and minimize environmental impacts at each stage",
        "To maximize resource extraction",
        "To ignore end-of-life considerations"
      ],
      correctAnswer: 1
    }
  ],
  "1-3": [
    {
      question: "What is green building?",
      options: [
        "Any building painted green",
        "A structure creating maximum environmental impact",
        "A building made entirely of recycled materials",
        "Creating structures that are environmentally responsible throughout their lifecycle"
      ],
      correctAnswer: 3
    },
    {
      question: "Which of these is NOT an element of green building?",
      options: [
        "Energy efficiency",
        "Maximum water consumption",
        "Sustainable material usage",
        "Indoor environmental quality management"
      ],
      correctAnswer: 1
    },
    {
      question: "How can water efficiency be achieved in green buildings?",
      options: [
        "By increasing water usage",
        "Through rainwater harvesting and greywater recycling",
        "By ignoring water management",
        "Through increased runoff into storm drains"
      ],
      correctAnswer: 1
    },
    {
      question: "Why is indoor environmental quality important in green buildings?",
      options: [
        "It's not important in green building",
        "For aesthetic purposes only",
        "For occupant health and comfort",
        "Only to reduce heating costs"
      ],
      correctAnswer: 2
    },
    {
      question: "Which lifecycle phase is NOT considered in green building practices?",
      options: [
        "Planning",
        "Construction",
        "Operation",
        "All phases are considered in green building"
      ],
      correctAnswer: 3
    }
  ],
  "2-1": [
    {
      question: "What does CDM stand for?",
      options: [
        "Carbon Development Management",
        "Climate Damage Mitigation",
        "Clean Development Mechanism",
        "Certified Development Method"
      ],
      correctAnswer: 2
    },
    {
      question: "Under which protocol was the CDM established?",
      options: [
        "Montreal Protocol",
        "Paris Agreement",
        "Kyoto Protocol",
        "Geneva Convention"
      ],
      correctAnswer: 2
    },
    {
      question: "What does one CER credit represent?",
      options: [
        "One ton of methane",
        "One ton of carbon dioxide or equivalent",
        "One kilogram of carbon dioxide",
        "One hectare of reforested land"
      ],
      correctAnswer: 1
    },
    {
      question: "What are the two main objectives of the CDM?",
      options: [
        "To increase profits and reduce costs",
        "To help developed countries meet emission targets and assist developing countries in sustainable development",
        "To promote international trade and technology transfer",
        "To replace fossil fuels and promote nuclear energy"
      ],
      correctAnswer: 1
    },
    {
      question: "Which organization oversees the CDM?",
      options: [
        "World Health Organization (WHO)",
        "World Trade Organization (WTO)",
        "United Nations Framework Convention on Climate Change (UNFCCC)",
        "International Monetary Fund (IMF)"
      ],
      correctAnswer: 2
    }
  ],
  "2-2": [
    {
      question: "What is a carbon credit?",
      options: [
        "A monetary loan secured against carbon assets",
        "A tax on carbon emissions",
        "A permit allowing emission of one ton of carbon dioxide or equivalent",
        "A reward for planting trees"
      ],
      correctAnswer: 2
    },
    {
      question: "How does carbon trading work?",
      options: [
        "Companies must reduce emissions without trading",
        "Companies exceeding emission limits can purchase credits from those below their limits",
        "Carbon trading involves only governments, not companies",
        "Carbon trading requires all participants to reduce emissions equally"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the primary goal of carbon trading?",
      options: [
        "To increase government revenue through taxes",
        "To eliminate all carbon emissions immediately",
        "To provide economic incentives for emission reduction while reducing overall emissions",
        "To penalize developing countries"
      ],
      correctAnswer: 2
    },
    {
      question: "Which of these is NOT a common type of carbon offset project?",
      options: [
        "Renewable energy projects",
        "Reforestation initiatives",
        "Increased fossil fuel extraction",
        "Energy efficiency improvements"
      ],
      correctAnswer: 2
    },
    {
      question: "What challenge do carbon markets often face?",
      options: [
        "Too few carbon credits available",
        "Ensuring the quality and verification of emission reductions",
        "Excessive demand for high-carbon industries",
        "Too much regulation"
      ],
      correctAnswer: 1
    }
  ],
  "2-3": [
    {
      question: "What does 'additionality' mean in CDM projects?",
      options: [
        "The project adds pollution to the environment",
        "The project would not have occurred without the CDM",
        "The project adds more than one type of environmental benefit",
        "The project is in addition to other environmental initiatives"
      ],
      correctAnswer: 1
    },
    {
      question: "What is the first step in implementing a CDM project?",
      options: [
        "Issuance of CERs",
        "Verification by a DOE",
        "Project design and development",
        "Registration with the CDM Executive Board"
      ],
      correctAnswer: 2
    },
    {
      question: "Who verifies CDM projects?",
      options: [
        "The project developer",
        "The host country government",
        "A designated operational entity (DOE)",
        "The United Nations directly"
      ],
      correctAnswer: 2
    },
    {
      question: "Which of these is NOT a common type of CDM project?",
      options: [
        "Renewable energy installations",
        "Coal power plants",
        "Energy efficiency improvements",
        "Waste management initiatives"
      ],
      correctAnswer: 1
    },
    {
      question: "What must CDM projects contribute to in the host country?",
      options: [
        "Economic growth only",
        "Political stability",
        "Sustainable development",
        "Cultural preservation"
      ],
      correctAnswer: 2
    }
  ],
  "3-1": [
    {
      question: "What does EIA stand for?",
      options: [
        "Environmental Investment Account",
        "Ecological Impact Analysis",
        "Environmental Impact Assessment",
        "Economic Influence Appraisal"
      ],
      correctAnswer: 2
    },
    {
      question: "What is the primary purpose of an EIA?",
      options: [
        "To block all development projects",
        "To ensure decision-makers consider environmental impacts",
        "To increase project costs",
        "To delay project implementation"
      ],
      correctAnswer: 1
    },
    {
      question: "Which impacts does an EIA consider?",
      options: [
        "Only environmental impacts",
        "Only economic impacts",
        "Environmental, socio-economic, cultural, and human-health impacts",
        "Only visual and noise impacts"
      ],
      correctAnswer: 2
    },
    {
      question: "When is the best time to conduct an EIA?",
      options: [
        "After project implementation",
        "During project construction",
        "Early in the planning and design phase",
        "Only after problems arise"
      ],
      correctAnswer: 2
    },
    {
      question: "How does an EIA help improve projects?",
      options: [
        "By identifying issues early and allowing for mitigation measures",
        "By simply documenting environmental damage",
        "By focusing only on compliance with regulations",
        "By providing a way to avoid public consultation"
      ],
      correctAnswer: 0
    }
  ],
  "3-2": [
    {
      question: "Which of the following is NOT a typical step in EIA methodology?",
      options: [
        "Screening",
        "Scoping",
        "Project financing",
        "Impact analysis"
      ],
      correctAnswer: 2
    },
    {
      question: "What is the purpose of the 'scoping' phase in an EIA?",
      options: [
        "To determine project funding",
        "To identify key issues and impacts that should be studied",
        "To select contractors for the project",
        "To market the project to stakeholders"
      ],
      correctAnswer: 1
    },
    {
      question: "Which of these is a tool used in EIA?",
      options: [
        "Social media surveys",
        "Political influence assessment",
        "Matrices and overlays",
        "Historical artifact collection"
      ],
      correctAnswer: 2
    },
    {
      question: "What factors influence the selection of EIA methods?",
      options: [
        "Only the project budget",
        "Only regulatory requirements",
        "Multiple factors including project nature, resources, and expertise",
        "Only the preference of the project developer"
      ],
      correctAnswer: 2
    },
    {
      question: "What is the purpose of monitoring in the EIA process?",
      options: [
        "To create additional documentation",
        "To check compliance with predictions and ensure mitigation measures are working",
        "To provide jobs for environmental scientists",
        "To delay project completion"
      ],
      correctAnswer: 1
    }
  ],
  "3-3": [
    {
      question: "Why are EIA case studies valuable?",
      options: [
        "They provide entertainment for students",
        "They offer insights into practical application and effectiveness of EIA",
        "They are required by law",
        "They only show failures to avoid"
      ],
      correctAnswer: 1
    },
    {
      question: "What do effective EIA case studies often reveal as important?",
      options: [
        "Minimal stakeholder engagement",
        "Limited baseline data collection",
        "Early stakeholder engagement and thorough baseline data",
        "Focusing only on economic benefits"
      ],
      correctAnswer: 2
    },
    {
      question: "What is adaptive management in the context of EIA?",
      options: [
        "Changing project goals to maximize profit",
        "Ignoring monitoring results",
        "Allowing modifications based on monitoring results and changing conditions",
        "Adapting to political pressure"
      ],
      correctAnswer: 2
    },
    {
      question: "What challenge is often highlighted in EIA case studies?",
      options: [
        "Too much public participation",
        "Balancing development needs with environmental protection",
        "Excessive environmental regulations",
        "Too many mitigation measures"
      ],
      correctAnswer: 1
    },
    {
      question: "What aspect of EIA is often found to need improvement in case studies?",
      options: [
        "Involving too many stakeholders",
        "Conducting too many studies",
        "Post-approval monitoring and implementation of mitigation measures",
        "Being too strict with environmental standards"
      ],
      correctAnswer: 2
    }
  ]
};

// Environmental tips for the floating tip component
const environmentalTips = [
  "Turn off lights when you leave a room to save energy!",
  "Use reusable water bottles instead of disposable plastic ones.",
  "Take shorter showers to conserve water.",
  "Plant native species in your garden to support local wildlife.",
  "Reduce, reuse, recycle - in that order of priority!",
  "Walk or cycle for short distances instead of driving.",
  "Buy local produce to reduce carbon emissions from transportation.",
  "Use a reusable shopping bag instead of plastic bags.",
  "Compost food scraps to reduce waste and create nutrient-rich soil.",
  "Unplug electronics when not in use to prevent phantom energy use.",
  "Use natural cleaning products to reduce chemical pollution.",
  "Fix leaking faucets promptly to save water.",
  "Lower your thermostat by just 1-2 degrees to save energy.",
  "Use cold water for laundry when possible.",
  "Choose energy-efficient appliances with high ENERGY STAR ratings.",
  "Support sustainable brands that prioritize environmental responsibility.",
  "Start a small herb garden on your windowsill.",
  "Use public transportation or carpool to reduce emissions.",
  "Avoid single-use plastics like straws and cutlery.",
  "Properly dispose of electronic waste through recycling programs."
];

// Export data for use in other files
export { courseData, quizQuestions, environmentalTips };