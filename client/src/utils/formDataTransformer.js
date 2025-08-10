// Simple function to convert Map to Object for correctAnswers
export const fixCorrectAnswers = (formData) => {
    const fixedData = { ...formData };

    if (fixedData.questions) {
        fixedData.questions = fixedData.questions.map((question) => {
            const fixedQuestion = { ...question };

            // Fix correctAnswers if it's a Map
            if (question.correctAnswers instanceof Map) {
                const obj = {};
                question.correctAnswers.forEach((value, key) => {
                    obj[key] = value;
                });
                fixedQuestion.correctAnswers = obj;
            }

            return fixedQuestion;
        });
    }

    return fixedData;
};
