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
            item.toLowerCase() === cleanedDepartment.toLowerCase()
    );

    return exactDepartment || "Administration";
};

const normalizeCategory = (category = "") => {
    const cleanedCategory = category.trim();

    const exactCategory = allowedCategories.find(
        (item) =>
            item.toLowerCase() === cleanedCategory.toLowerCase()
    );

    return exactCategory || "Other";
};

const normalizePriority = (priority = "") => {
    const cleanedPriority = priority.trim();

    const exactPriority = allowedPriorities.find(
        (item) =>
            item.toLowerCase() === cleanedPriority.toLowerCase()
    );

    return exactPriority || "Medium";
};

const analyzeComplaint = async (title, description) => {
    try {
        const prompt = `
You are an AI assistant for a college complaint management system.

Analyze the complaint below.

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

Department routing examples:

- Wi-Fi, computers, portals, software and projectors -> IT
- Hostel rooms, hostel food and hostel water -> Hostel
- Books, library cards and reading rooms -> Library
- Buses and college transport -> Transport
- Exams, marks, hall tickets and timetables -> Examination
- Plumbing, electricity and building repairs -> Maintenance
- Fees, payments and scholarships -> Accounts
- Sports equipment and facilities -> Sports
- Jobs, internships and campus recruitment -> Placement
- Theft, harassment and safety issues -> Security
- General college matters -> Administration

Important rules:

- Department must be exactly one allowed department value.
- Never return "IT Department", "Hostel Department" or similar wording.
- Summary must contain a maximum of 25 words.
- Troubleshooting must contain 3 to 4 practical steps.
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
                    ? parsedResult.summary.trim().slice(0, 250)
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

module.exports = {
    analyzeComplaint
};