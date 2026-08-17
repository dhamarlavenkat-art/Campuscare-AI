const axios = require("axios");

const allowedDepartments = [
    "Administration",
    "IT",
    "Library",
    "Hostel",
    "Transport",
    "Examination",
    "Maintenance",
    "Accounts",
    "Sports",
    "Placement",
    "Security"
];

const allowedCategories = [
    "Maintenance",
    "Academic",
    "Hostel",
    "IT",
    "Transport",
    "Security",
    "Library",
    "Accounts",
    "Sports",
    "Placement",
    "Other"
];

const allowedPriorities = [
    "Low",
    "Medium",
    "High"
];

const departmentMap = {
    "IT Department": "IT",
    "Hostel Department": "Hostel",
    "Library Department": "Library",
    "Transport Department": "Transport",
    "Security Department": "Security",
    "Maintenance Department": "Maintenance",
    "Examination Department": "Examination",
    "Accounts Department": "Accounts",
    "Sports Department": "Sports",
    "Placement Department": "Placement",
    "Administration Department": "Administration",
    General: "Administration"
};

const normalizeDepartment = (department = "") => {
    const cleanedDepartment = department.trim();

    if (departmentMap[cleanedDepartment]) {
        return departmentMap[cleanedDepartment];
    }

    const exactDepartment = allowedDepartments.find(
        (item) =>
            item.toLowerCase() ===
            cleanedDepartment.toLowerCase()
    );

    return exactDepartment || "Administration";
};

const normalizeCategory = (category = "") => {
    const cleanedCategory = category.trim();

    const exactCategory = allowedCategories.find(
        (item) =>
            item.toLowerCase() ===
            cleanedCategory.toLowerCase()
    );

    return exactCategory || "Other";
};

const normalizePriority = (priority = "") => {
    const cleanedPriority = priority.trim();

    const exactPriority = allowedPriorities.find(
        (item) =>
            item.toLowerCase() ===
            cleanedPriority.toLowerCase()
    );

    return exactPriority || "Medium";
};

const analyzeComplaint = async (title, description) => {
    try {
        const prompt = `
You are an AI assistant for a college complaint management system.

Analyze the complaint below and route it to the most appropriate department.

Title:
${title}

Description:
${description}

Return ONLY valid JSON in exactly this format:

{
  "category": "",
  "priority": "",
  "department": "",
  "summary": "",
  "troubleshooting": []
}

Allowed categories:

- Maintenance
- Academic
- Hostel
- IT
- Transport
- Security
- Library
- Accounts
- Sports
- Placement
- Other

Allowed priorities:

- Low
- Medium
- High

Allowed departments:

- Administration
- IT
- Library
- Hostel
- Transport
- Examination
- Maintenance
- Accounts
- Sports
- Placement
- Security

Department routing rules:

IT:
- Wi-Fi
- Internet
- Network
- Computers
- Laptops
- Desktops
- Computer labs
- Printers
- Projectors
- Smart boards
- HDMI issues
- VGA issues
- Display issues
- Screen sharing
- AV equipment
- Software problems
- College portals
- Login issues
- System errors
- Technology-related problems

Maintenance:
- Plumbing
- Water leakage
- Electrical wiring
- Switches
- Fans
- Lights
- Broken doors
- Broken windows
- Furniture repairs
- Wall damage
- Ceiling damage
- Building repairs
- Infrastructure damage
- Physical repair work

Hostel:
- Hostel rooms
- Hostel food
- Hostel water supply
- Hostel cleanliness
- Hostel facilities
- Hostel accommodation
- Roommate issues
- Hostel-specific problems

Library:
- Books
- Book availability
- Library cards
- Book issue and return
- Reading rooms
- Library timings
- Library facilities
- Library-specific services

Transport:
- College buses
- Bus routes
- Bus timings
- Bus drivers
- Bus stops
- Transport delays
- College transportation

Examination:
- Hall tickets
- Exam timetable
- Exam registration
- Marks
- Results
- Revaluation
- Answer scripts
- Internal exams
- External exams
- Examination-related problems

Accounts:
- College fees
- Fee receipts
- Payments
- Refunds
- Scholarships
- Fines
- Payment confirmation
- Financial transactions

Sports:
- Sports equipment
- Sports grounds
- Sports courts
- Sports teams
- Sports activities
- Sports events
- Sports facilities

Placement:
- Jobs
- Internships
- Placement drives
- Campus recruitment
- Company visits
- Interviews
- Aptitude tests
- Career opportunities

Security:
- Theft
- Harassment
- Threats
- Violence
- Suspicious activity
- Unauthorized persons
- Safety concerns
- Lost valuables
- Emergency security issues

Administration:
- Faculty-related concerns
- Department coordination
- College policies
- Permissions
- Certificates
- General institutional matters
- Administrative requests
- Complaints that do not clearly belong to another department

Important routing conflict rules:

- Projector, HDMI, VGA, display, smart board and AV system issues must go to IT.

- Projector mounting problems, wall damage, ceiling damage or electrical wiring problems must go to Maintenance.

- Computer lab hardware, internet or software problems must go to IT.

- Hostel-specific problems should go to Hostel even if they involve basic facilities.

- General campus building repair should go to Maintenance.

- Exam timetable, hall ticket, marks, results and revaluation issues must go to Examination, not Administration.

- Fees, scholarships, refunds, receipts and payment-related problems must go to Accounts, not Administration.

- Theft, harassment, threats and safety issues must go to Security, not Administration.

- Sports equipment or sports activity problems must go to Sports.

- Structural damage to a sports building or facility should go to Maintenance.

- Library book or library service problems must go to Library.

- If a complaint clearly matches a specific department, always choose that department instead of Administration.

- Administration should only be used when no specific department clearly matches the complaint.

Category consistency rules:

- Technology, software, computer, projector, network and portal issues must normally use category "IT".

- Physical repairs, plumbing, wiring and building damage must normally use category "Maintenance".

- Hostel-specific issues must normally use category "Hostel".

- Transport issues must normally use category "Transport".

- Security issues must normally use category "Security".

- Library issues must normally use category "Library".

- Fee and payment issues must normally use category "Accounts".

- Sports issues must normally use category "Sports".

- Placement and internship issues must normally use category "Placement".

Priority guidelines:

Low:
- Minor inconvenience
- Non-urgent request
- Issue does not significantly affect students or services

Medium:
- Issue affects normal student activities
- Service is unavailable or disrupted
- Requires attention but is not an emergency

High:
- Safety risk
- Security threat
- Major service outage
- Exam-related urgent issue
- Serious infrastructure damage
- Issue affecting many students
- Immediate administrative attention required

Important output rules:

- Department must be exactly one of the allowed department values.
- Category must be exactly one of the allowed category values.
- Priority must be exactly Low, Medium or High.
- Never return "IT Department", "Hostel Department" or similar wording.
- Summary must contain a maximum of 25 words.
- Troubleshooting must contain 3 to 4 practical steps.
- Troubleshooting should only contain safe and realistic student-level steps.
- Do not recommend dangerous electrical or physical repair work.
- Do not include markdown.
- Do not include explanations outside the JSON.
`;

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                response_format: {
                    type: "json_object"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );

        const result =
            response.data?.choices?.[0]?.message?.content;

        if (!result) {
            throw new Error("AI returned an empty response");
        }

        const cleanResult = result
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        console.log("AI Response:");
        console.log(cleanResult);

        const parsedResult = JSON.parse(cleanResult);

        return {
            category: normalizeCategory(
                parsedResult.category
            ),

            priority: normalizePriority(
                parsedResult.priority
            ),

            department: normalizeDepartment(
                parsedResult.department
            ),

            summary:
                typeof parsedResult.summary === "string"
                    ? parsedResult.summary
                          .trim()
                          .slice(0, 250)
                    : "Complaint submitted for review.",

            troubleshooting: Array.isArray(
                parsedResult.troubleshooting
            )
                ? parsedResult.troubleshooting
                      .filter(
                          (step) =>
                              typeof step === "string" &&
                              step.trim()
                      )
                      .slice(0, 4)
                : []
        };
    } catch (error) {
        console.log(
            "AI analysis failed:",
            error.response?.data || error.message
        );

        return {
            category: "Other",
            priority: "Medium",
            department: "Administration",
            summary: "Unable to generate AI summary.",
            troubleshooting: []
        };
    }
};

const generateAdminSuggestions = async (complaint) => {
    const prompt = `
You assist an experienced college complaint administrator.

Provide concise optional investigation or resolution suggestions for this complaint.
Do not explain basic administrative duties. Focus on practical checks, likely causes,
safe verification steps, and useful evidence to collect before resolution.

Title: ${complaint.title}
Description: ${complaint.description}
Category: ${complaint.category}
Priority: ${complaint.priority}
Location: ${complaint.location?.building || "Unknown"}, Room ${complaint.location?.roomNumber || "Unknown"}
Asset: ${complaint.location?.assetType || "Not specified"}

Return ONLY valid JSON in this format:
{
  "suggestions": []
}

Rules:
- Return 2 to 4 suggestions.
- Each suggestion must be one short, actionable sentence.
- Do not recommend dangerous electrical, structural, or security actions.
- Do not include markdown or any text outside the JSON.
`;

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 20000
            }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) throw new Error("AI returned an empty response");

        const parsed = JSON.parse(
            content.replace(/```json/gi, "").replace(/```/g, "").trim()
        );

        return Array.isArray(parsed.suggestions)
            ? parsed.suggestions
                  .filter((suggestion) => typeof suggestion === "string" && suggestion.trim())
                  .map((suggestion) => suggestion.trim())
                  .slice(0, 4)
            : [];
    } catch (error) {
        console.log(
            "Admin suggestion generation failed:",
            error.response?.data || error.message
        );
        throw new Error("Unable to generate AI suggestions right now");
    }
};

module.exports = {
    analyzeComplaint,
    generateAdminSuggestions
};
