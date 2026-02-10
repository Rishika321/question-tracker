import { create } from 'zustand';

const useQuestionStore = create((set, get) => ({
  topics: [],
  isLoading: false,
  error: null,

  // Load initial data
  loadData: (data) => set({ topics: data }),

  // Topic operations
  addTopic: (topic) => set((state) => ({
    topics: [...state.topics, {
      id: Date.now().toString(),
      title: topic.title,
      description: topic.description || '',
      subTopics: [],
      questions: [],
      order: state.topics.length
    }]
  })),

  updateTopic: (topicId, updates) => set((state) => ({
    topics: state.topics.map(topic =>
      topic.id === topicId ? { ...topic, ...updates } : topic
    )
  })),

  deleteTopic: (topicId) => set((state) => ({
    topics: state.topics.filter(topic => topic.id !== topicId)
  })),

  // Subtopic operations
  addSubTopic: (topicId, subTopic) => set((state) => ({
    topics: state.topics.map(topic =>
      topic.id === topicId
        ? {
            ...topic,
            subTopics: [...topic.subTopics, {
              id: Date.now().toString(),
              title: subTopic.title,
              description: subTopic.description || '',
              questions: [],
              order: topic.subTopics.length
            }]
          }
        : topic
    )
  })),

  updateSubTopic: (topicId, subTopicId, updates) => set((state) => ({
    topics: state.topics.map(topic =>
      topic.id === topicId
        ? {
            ...topic,
            subTopics: topic.subTopics.map(subTopic =>
              subTopic.id === subTopicId ? { ...subTopic, ...updates } : subTopic
            )
          }
        : topic
    )
  })),

  deleteSubTopic: (topicId, subTopicId) => set((state) => ({
    topics: state.topics.map(topic =>
      topic.id === topicId
        ? {
            ...topic,
            subTopics: topic.subTopics.filter(subTopic => subTopic.id !== subTopicId)
          }
        : topic
    )
  })),

  // Question operations
  addQuestion: (topicId, subTopicId, question) => set((state) => ({
    topics: state.topics.map(topic => {
      if (topic.id === topicId) {
        const newQuestion = {
          id: Date.now().toString(),
          title: question.title,
          description: question.description || '',
          difficulty: question.difficulty || 'Medium',
          tags: question.tags || [],
          solved: false,
          order: subTopicId 
            ? topic.subTopics.find(st => st.id === subTopicId)?.questions.length || 0
            : topic.questions.length
        };

        if (subTopicId) {
          return {
            ...topic,
            subTopics: topic.subTopics.map(subTopic =>
              subTopic.id === subTopicId
                ? { ...subTopic, questions: [...subTopic.questions, newQuestion] }
                : subTopic
            )
          };
        } else {
          return {
            ...topic,
            questions: [...topic.questions, newQuestion]
          };
        }
      }
      return topic;
    })
  })),

  updateQuestion: (topicId, subTopicId, questionId, updates) => set((state) => ({
    topics: state.topics.map(topic => {
      if (topic.id === topicId) {
        if (subTopicId) {
          return {
            ...topic,
            subTopics: topic.subTopics.map(subTopic =>
              subTopic.id === subTopicId
                ? {
                    ...subTopic,
                    questions: subTopic.questions.map(question =>
                      question.id === questionId ? { ...question, ...updates } : question
                    )
                  }
                : subTopic
            )
          };
        } else {
          return {
            ...topic,
            questions: topic.questions.map(question =>
              question.id === questionId ? { ...question, ...updates } : question
            )
          };
        }
      }
      return topic;
    })
  })),

  deleteQuestion: (topicId, subTopicId, questionId) => set((state) => ({
    topics: state.topics.map(topic => {
      if (topic.id === topicId) {
        if (subTopicId) {
          return {
            ...topic,
            subTopics: topic.subTopics.map(subTopic =>
              subTopic.id === subTopicId
                ? {
                    ...subTopic,
                    questions: subTopic.questions.filter(question => question.id !== questionId)
                  }
                : subTopic
            )
          };
        } else {
          return {
            ...topic,
            questions: topic.questions.filter(question => question.id !== questionId)
          };
        }
      }
      return topic;
    })
  })),

  // Reorder operations
  reorderTopics: (startIndex, endIndex) => set((state) => {
    const topics = Array.from(state.topics);
    const [removed] = topics.splice(startIndex, 1);
    topics.splice(endIndex, 0, removed);
    
    return {
      topics: topics.map((topic, index) => ({ ...topic, order: index }))
    };
  }),

  reorderSubTopics: (topicId, startIndex, endIndex) => set((state) => ({
    topics: state.topics.map(topic => {
      if (topic.id === topicId) {
        const subTopics = Array.from(topic.subTopics);
        const [removed] = subTopics.splice(startIndex, 1);
        subTopics.splice(endIndex, 0, removed);
        
        return {
          ...topic,
          subTopics: subTopics.map((subTopic, index) => ({ ...subTopic, order: index }))
        };
      }
      return topic;
    })
  })),

  reorderQuestions: (topicId, subTopicId, startIndex, endIndex) => set((state) => ({
    topics: state.topics.map(topic => {
      if (topic.id === topicId) {
        if (subTopicId) {
          return {
            ...topic,
            subTopics: topic.subTopics.map(subTopic => {
              if (subTopic.id === subTopicId) {
                const questions = Array.from(subTopic.questions);
                const [removed] = questions.splice(startIndex, 1);
                questions.splice(endIndex, 0, removed);
                
                return {
                  ...subTopic,
                  questions: questions.map((question, index) => ({ ...question, order: index }))
                };
              }
              return subTopic;
            })
          };
        } else {
          const questions = Array.from(topic.questions);
          const [removed] = questions.splice(startIndex, 1);
          questions.splice(endIndex, 0, removed);
          
          return {
            ...topic,
            questions: questions.map((question, index) => ({ ...question, order: index }))
          };
        }
      }
      return topic;
    })
  })),

  // Utility functions
  getTopicStats: (topicId) => {
    const state = get();
    const topic = state.topics.find(t => t.id === topicId);
    if (!topic) return { total: 0, solved: 0 };
    
    let total = topic.questions.length;
    let solved = topic.questions.filter(q => q.solved).length;
    
    topic.subTopics.forEach(subTopic => {
      total += subTopic.questions.length;
      solved += subTopic.questions.filter(q => q.solved).length;
    });
    
    return { total, solved };
  }
}));

export default useQuestionStore;
