const axios = require("axios");

const analyzeComplaint = async(title,description)=>{
    try{
        const prompt = `
        You are an AI assistant for a college complaint management system.
        Analyze the complaint below.
        Title:
        ${title}
        Description:
        ${description}
        Return ONLY valid JSON.
        {
        "category":"",
        "priority":"",
        "department":"",
        "summary":"",
        "troubleshooting":[]
        }
        Rules:
        Categories:
        -Maintenance
        -Academic
        -Hostel
        -IT,
        -Transport
        -Security
        -Other
        Priority:
        -Low
        -Medium
        -High
        Department
        Choose the best department.
        
        Summary
        Maximum 25 words.
        Troubleshooting:
        Return 3-4 practical troubleshooting steps as an array of strings.
        `;

            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model:"llama-3.3-70b-versatile",
                    messages:[
                        {
                            role:"user",
                            content:prompt
                        }
                    ],
                    temperature:0.2
                },
                {
                    headers:{
                        Authorization:`Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type":"application/json"
                    }
                }
            );
            const result = response.data.choices[0].message.content;

// Remove markdown code fences if present
const cleanResult = result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

console.log("AI Response:");
console.log(cleanResult);

return JSON.parse(cleanResult);
    }catch(error){
        console.log(error.response?.data || error.message);
        return{
            category:"Other",
            priority:"Medium",
            department:"General",
            summary:"Unable to generate AI summary",
            troubleshooting:[]
        };
    }
};


module.exports={
    analyzeComplaint
};