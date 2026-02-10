// import SheetPage from "./pages/SheetPage";

// function App() {
//   return <SheetPage />;
  
// }

// export default App;

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Save, BookOpen, Target, TrendingUp } from 'lucide-react';
import useQuestionStore from './store/useQuestionStore';
import TopicItem from './components/TopicItem';
import AddItemModal from './components/AddItemModal';
import { questionAPI } from './services/api';

function App() {
  const { 
    topics, 
    loadData, 
    addTopic, 
    reorderTopics, 
    reorderSubTopics, 
    reorderQuestions 
  } = useQuestionStore();
  
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await questionAPI.fetchSheetData();
        loadData(data);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadData]);

  const handleAddTopic = (topicData) => {
    addTopic(topicData);
    setShowTopicModal(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await questionAPI.saveSheet(topics);
      // Show success message
    } catch (error) {
      console.error('Failed to save:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'topic') {
      reorderTopics(source.index, destination.index);
    } else if (type === 'subtopic') {
      const topicId = source.droppableId.replace('topic-', '').replace('-subtopics', '');
      reorderSubTopics(topicId, source.index, destination.index);
    } else if (type === 'question') {
      const sourceIds = source.droppableId.split('-');
      const destIds = destination.droppableId.split('-');
      
      if (sourceIds[0] === 'topic' && sourceIds[2] === 'questions') {
        // Direct topic questions
        const topicId = sourceIds[1];
        reorderQuestions(topicId, null, source.index, destination.index);
      } else if (sourceIds[0] === 'subtopic') {
        // Subtopic questions
        const subTopicId = sourceIds[1];
        const topicId = topics.find(topic => 
          topic.subTopics.some(st => st.id === subTopicId)
        )?.id;
        
        if (topicId) {
          reorderQuestions(topicId, subTopicId, source.index, destination.index);
        }
      }
    }
  };

  // Calculate overall statistics
  const overallStats = topics.reduce((acc, topic) => {
    const topicTotal = topic.questions.length + topic.subTopics.reduce((sum, st) => sum + st.questions.length, 0);
    const topicSolved = topic.questions.filter(q => q.solved).length + 
                       topic.subTopics.reduce((sum, st) => sum + st.questions.filter(q => q.solved).length, 0);
    
    acc.total += topicTotal;
    acc.solved += topicSolved;
    return acc;
  }, { total: 0, solved: 0 });

  const overallProgress = overallStats.total > 0 ? Math.round((overallStats.solved / overallStats.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your question sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Question Management Sheet</h1>
                <p className="text-gray-600 mt-1">Organize and track your coding questions by topics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowTopicModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Topic
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Target className="text-blue-600 mr-2" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <TrendingUp className="text-green-600 mr-2" size={20} />
                <div>
                  <p className="text-sm font-medium text-green-900">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{overallStats.solved}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="mr-2">
                  <div className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center">
                    <div 
                      className="w-3 h-3 rounded-full bg-purple-600"
                      style={{ 
                        background: `conic-gradient(#9333ea ${overallProgress * 3.6}deg, #e5e7eb 0deg)` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Progress</p>
                  <p className="text-2xl font-bold text-purple-600">{overallProgress}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="topics" type="topic">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 ${snapshot.isDraggingOver ? 'bg-blue-25' : ''}`}
              >
                {topics.map((topic, index) => (
                  <TopicItem key={topic.id} topic={topic} index={index} />
                ))}
                {provided.placeholder}
                
                {topics.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                    <p className="text-gray-500 mb-6">Create your first topic to start organizing questions</p>
                    <button
                      onClick={() => setShowTopicModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Your First Topic
                    </button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add Topic Modal */}
        <AddItemModal
          isOpen={showTopicModal}
          onClose={() => setShowTopicModal(false)}
          onSubmit={handleAddTopic}
          type="topic"
        />
      </div>
    </div>
  );
}

export default App;
