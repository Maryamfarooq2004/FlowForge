import axiosInstance from '../lib/axios';

export interface Question {
  id: string;
  section: string;
  question: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  yesLabel?: string;
  noLabel?: string;
  order?: number;
}

const getQuestions = async (category: 'clinic' | 'school'): Promise<Question[]> => {
  const response = await axiosInstance.get(`/intake/questions?category=${category}`);
  return response.data.data;
};

const saveIntakeForm = async (projectId: string, data: Record<string, any>) => {
  const response = await axiosInstance.patch(`/intake/${projectId}/form`, data);
  return response.data;
};

export default {
  getQuestions,
  saveIntakeForm
};
