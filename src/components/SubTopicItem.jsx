import React, { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import useQuestionStore from '../store/useQuestionStore';
import QuestionItem from './QuestionItem';
import AddItemModal from './AddItemModal';

const SubTopicItem = ({ subTopic, index, topicId }) => {
  const { addQuestion, updateQuestion, updateSubTopic, deleteSubTopic } = useQuestionStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showSubTopicModal, setShowSubTopicModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleAddQuestion = (questionData) => {
    if (editingQuestion) {
      updateQuestion(topicId, subTopic.id, editingQuestion.id, questionData);
      setEditingQuestion(null);
    } else {
      addQuestion(topicId, subTopic.id, questionData);
    }
    setShowQuestionModal(false);
  };

  const handleEditSubTopic = (subTopicData) => {
    updateSubTopic(topicId, subTopic.id, subTopicData);
    setShowSubTopicModal(false);
  };

  const handleDeleteSubTopic = () => {
    deleteSubTopic(topicId, subTopic.id);
    setShowConfirmDelete(false);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const solvedCount = subTopic.questions.filter(q => q.solved).length;
  const totalCount = subTopic.questions.length;

  return (
    <Draggable draggableId={`subtopic-${subTopic.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`subtopic-item ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                {...provided.dragHandleProps}
                className="text-gray-400 hover:text-gray-600 cursor-grab"
              >
                <GripVertical size={16} />
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">{subTopic.title}</h3>
                {subTopic.description && (
                  <p className="text-sm text-gray-600 mt-1">{subTopic.description}</p>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {solvedCount}/{totalCount} completed
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowQuestionModal(true)}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Add Question"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowSubTopicModal(true)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit Sub-topic"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Sub-topic"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {isExpanded && (
            <Droppable droppableId={`subtopic-${subTopic.id}`} type="question">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[50px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                >
                  {subTopic.questions.map((question, qIndex) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={qIndex}
                      topicId={topicId}
                      subTopicId={subTopic.id}
                      onEdit={handleEditQuestion}
                    />
                  ))}
                  {provided.placeholder}
                  
                  {subTopic.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="mb-2">No questions yet</p>
                      <button
                        onClick={() => setShowQuestionModal(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Add your first question
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          )}

          {showConfirmDelete && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete this sub-topic and all its questions? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteSubTopic}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
            isOpen={showSubTopicModal}
            onClose={() => setShowSubTopicModal(false)}
            onSubmit={handleEditSubTopic}
            type="sub-topic"
            initialData={subTopic}
          />
        </div>
      )}
    </Draggable>
  );
};

export default SubTopicItem;
