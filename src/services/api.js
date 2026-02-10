export const questionAPI = {
  async fetchSheetData() {
    try {
      const response = await fetch(
        "https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sheet data");
      }

      const result = await response.json();
      const { sheet, questions } = result.data;

      const mappedData = [
        {
          id: sheet._id,
          title: sheet.name,
          description: sheet.description,
          order: 0,

          questions: questions
            .filter((q) => !q.subTopic)
            .map((q, index) => ({
              id: q._id,
              title: q.title || q.questionId?.name,
              description: q.questionId?.description || "",
              difficulty: q.questionId?.difficulty,
              tags: q.questionId?.topics || [],
              videoLink: q.resource || "", 
              solved: false,
              order: index,
            })),

  
          subTopics: Array.from(
            new Set(questions.map((q) => q.subTopic).filter(Boolean))
          ).map((subTopicName, stIndex) => ({
            id: `st-${stIndex}`,
            title: subTopicName,
            description: "",
            order: stIndex,
            questions: questions
              .filter((q) => q.subTopic === subTopicName)
              .map((q, index) => ({
                id: q._id,
                title: q.title || q.questionId?.name,
                description: q.questionId?.description || "",
                difficulty: q.questionId?.difficulty,
                tags: q.questionId?.topics || [],
                videoLink: q.resource || "", 
                solved: false,
                order: index,
              })),
          })),
        },
      ];

      return mappedData;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  async saveSheet(data) {
    console.log("Saving data:", data);
    return { success: true };
  },

  async createTopic(topicData) {
    console.log("Creating topic:", topicData);
    return { id: Date.now().toString(), ...topicData };
  },

  async updateTopic(topicId, topicData) {
    console.log("Updating topic:", topicId, topicData);
    return { success: true };
  },

  async deleteTopic(topicId) {
    console.log("Deleting topic:", topicId);
    return { success: true };
  },
};