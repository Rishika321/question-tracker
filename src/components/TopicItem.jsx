import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, GripVertical, BookOpen } from 'lucide-react';
import useQuestionStore from '../store/useQuestionStore';
import SubTopicItem from './SubTopicItem';
import QuestionItem from './QuestionItem';
import AddItemModal from './AddItemModal';

const TopicItem = ({ topic, index }) => {
  const { addSubTopic, addQuestion, updateTopic, deleteTopic, updateQuestion, getTopicStats } = useQuestionStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSubTopicModal, setShowSubTopicModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const stats = getTopicStats(topic.id);

  const handleAddSubTopic = (subTopicData) => {
    addSubTopic(topic.id, subTopicData);
    setShowSubTopicModal(false);
  };

  const handleAddQuestion = (questionData) => {
    if (editingQuestion) {
      updateQuestion(topic.id, null, editingQuestion.id, questionData);
      setEditingQuestion(null);
    } else {
      addQuestion(topic.id, null, questionData);
    }
    setShowQuestionModal(false);
  };

  const handleEditTopic = (topicData) => {
    updateTopic(topic.id, topicData);
    setShowTopicModal(false);
  };

  const handleDeleteTopic = () => {
    deleteTopic(topic.id);
    setShowConfirmDelete(false);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const progressPercentage = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;

  return (
    <Draggable draggableId={`topic-${topic.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`topic-item ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div
                {...provided.dragHandleProps}
                className="text-gray-400 hover:text-gray-600 cursor-grab"
              >
                <GripVertical size={18} />
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              
              <BookOpen size={18} className="text-blue-600" />
              
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{topic.title}</h2>
                {topic.description && (
                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                )}
                <div className="flex items-center mt-2 space-x-4">
                  <div className="text-sm text-gray-500">
                    {stats.solved}/{stats.total} completed ({progressPercentage}%)
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSubTopicModal(true)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Add Sub-topic"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowQuestionModal(true)}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                title="Add Question"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowTopicModal(true)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Topic"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Topic"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              {/* Sub-topics */}
              <Droppable droppableId={`topic-${topic.id}-subtopics`} type="subtopic">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[20px] ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''}`}
                  >
                    {topic.subTopics.map((subTopic, stIndex) => (
                      <SubTopicItem
                        key={subTopic.id}
                        subTopic={subTopic}
                        index={stIndex}
                        topicId={topic.id}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

            
              <Droppable droppableId={`topic-${topic.id}-questions`} type="question">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[20px] ${snapshot.isDraggingOver ? 'bg-purple-50 rounded-lg p-2' : ''}`}
                  >
                    {topic.questions.map((question, qIndex) => (
                      <QuestionItem
                        key={question.id}
                        question={question}
                        index={qIndex}
                        topicId={topic.id}
                        subTopicId={null}
                        onEdit={handleEditQuestion}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {topic.subTopics.length === 0 && topic.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="mb-4">This topic is empty</p>
                  <div className="space-x-4">
                    <button
                      onClick={() => setShowSubTopicModal(true)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Add a sub-topic
                    </button>
                    <span className="text-gray-400">or</span>
                    <button
                      onClick={() => setShowQuestionModal(true)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Add a question
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showConfirmDelete && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete this topic and all its contents? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteTopic}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete Topic
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          
          <AddItemModal
            isOpen={showSubTopicModal}
            onClose={() => setShowSubTopicModal(false)}
            onSubmit={handleAddSubTopic}
            type="sub-topic"
          />

          <AddItemModal
            isOpen={showQuestionModal}
            onClose={() => {
              setShowQuestionModal(false);
              setEditingQuestion(null);
            }}
            onSubmit={handleAddQuestion}
            type="question"
            initialData={editingQuestion}
          />

          <AddItemModal
            isOpen={showTopicModal}
            onClose={() => setShowTopicModal(false)}
            onSubmit={handleEditTopic}
            type="topic"
            initialData={topic}
          />
        </div>
      )}
    </Draggable>
  );
};

export default TopicItem;
