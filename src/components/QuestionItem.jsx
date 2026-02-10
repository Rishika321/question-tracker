import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  Edit2,
  Trash2,
  CheckCircle,
  Circle,
  Tag,
  Video   
} from 'lucide-react';
import useQuestionStore from '../store/useQuestionStore';

const QuestionItem = ({ question, index, topicId, subTopicId, onEdit }) => {
  const { updateQuestion, deleteQuestion } = useQuestionStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleToggleSolved = () => {
    updateQuestion(topicId, subTopicId, question.id, { solved: !question.solved });
  };

  const handleDelete = () => {
    deleteQuestion(topicId, subTopicId, question.id);
    setShowConfirmDelete(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Draggable draggableId={`question-${question.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`question-item ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="flex items-start space-x-3">
            <div
              {...provided.dragHandleProps}
              className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 cursor-grab"
            >
              <GripVertical size={16} />
            </div>

            
            <button
              onClick={handleToggleSolved}
              className="flex-shrink-0 mt-1 text-gray-400 hover:text-green-600 transition-colors"
            >
              {question.solved ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <Circle size={20} />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-base font-medium ${question.solved ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {question.title}
                </h4>

                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>

                
                  {question.videoLink && (
                    <a
                      href={question.videoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-purple-600 transition-colors"
                      title="Watch Video Solution"
                    >
                      <Video size={14} />
                    </a>
                  )}

                 
                  <button
                    onClick={() => onEdit(question)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>

                  
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              
              {question.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {question.description}
                </p>
              )}

              
              {question.tags && question.tags.length > 0 && (
                <div className="flex items-center mt-2 space-x-1">
                  <Tag size={12} className="text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {question.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          
          {showConfirmDelete && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleDelete}
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
        </div>
      )}
    </Draggable>
  );
};

export default QuestionItem;