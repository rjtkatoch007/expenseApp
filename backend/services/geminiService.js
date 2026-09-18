const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const categories = [
    "Food",
    "Petrol",
    "Salary",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Other"
];


const categorizeExpense = async (description) => {
    try {
        const prompt = `
You are an expense categorization assistant.

Categorize this expense into exactly ONE of these categories:

Food
Petrol
Salary
Shopping
Travel
Bills
Entertainment
Other

Expense:
"${description}"

Return ONLY the category name.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt
        });

        console.log("FULL GEMINI RESPONSE:");
        console.log(JSON.stringify(response, null, 2));

        // Try the different response formats
        let category = "";

        if (response.text) {
            category = response.text;
        } else if (
            response.candidates &&
            response.candidates[0] &&
            response.candidates[0].content &&
            response.candidates[0].content.parts &&
            response.candidates[0].content.parts[0]
        ) {
            category = response.candidates[0].content.parts[0].text;
        }

        console.log("Gemini category:", category);

        if (!category) {
            console.log("Gemini returned no category. Using Other.");
            return "Other";
        }

        category = category
            .trim()
            .replace(/["'`]/g, "")
            .trim();

        const matchedCategory = categories.find(
            item =>
                item.toLowerCase() === category.toLowerCase()
        );

        if (!matchedCategory) {
            console.log("Unknown category:", category);
            return "Other";
        }

        return matchedCategory;

    } catch (error) {
        console.log("Gemini categorization error:", error);
        return "Other";
    }
};


module.exports = {
    categorizeExpense
};