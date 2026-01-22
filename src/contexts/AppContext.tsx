/**
 * Application Context
 * Global state management for resume and LinkedIn optimization
 */

import * as React from 'react';
import type {
  JobDetails,
  ResumeEvaluation,
  LinkedInOptimizationPayload,
  ResumeItem,
  ParsedProfile,
  LinkedInAudit,
  UnifiedLinkedInAudit,
} from '@/services/api/types';

interface AppState {
  jobDetails: JobDetails | null;
  selectedFile: File | null;
  resumeS3Key: string | null;
  resumeId: string | null;
  resumeEvaluation: ResumeEvaluation | null;
  projectName: string | null;
  linkedinOptimization: LinkedInOptimizationPayload | null;
  parsedProfile: ParsedProfile | null;
  linkedInAudit: LinkedInAudit | UnifiedLinkedInAudit | null;
  isUploading: boolean;
  isEvaluating: boolean;
  uploadError: string | null;
  evaluationError: string | null;
}

interface AppActions {
  setJobDetails: (details: JobDetails) => void;
  setSelectedFile: (file: File | null) => void;
  setResumeS3Key: (key: string) => void;
  setResumeEvaluation: (id: string, evaluation: ResumeEvaluation) => void;
  setProjectName: (name: string | null) => void;
  setLinkedinOptimization: (optimization: LinkedInOptimizationPayload) => void;
  setParsedProfile: (profile: ParsedProfile) => void;
  setLinkedInAudit: (audit: LinkedInAudit | UnifiedLinkedInAudit) => void;
  setResumeItem: (item: ResumeItem) => void;
  setIsUploading: (isUploading: boolean) => void;
  setIsEvaluating: (isEvaluating: boolean) => void;
  setUploadError: (error: string | null) => void;
  setEvaluationError: (error: string | null) => void;
  resetState: () => void;
}

interface AppContextType extends AppState, AppActions { }

const initialState: AppState = {
  jobDetails: null,
  selectedFile: null,
  resumeS3Key: null,
  resumeId: null,
  resumeEvaluation: null,
  projectName: null,
  linkedinOptimization: null,
  parsedProfile: null,
  linkedInAudit: null,
  isUploading: false,
  isEvaluating: false,
  uploadError: null,
  evaluationError: null,
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}


export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = React.useState<AppState>(initialState);

  const setJobDetails = React.useCallback((details: JobDetails) => {
    setState((prev) => ({ ...prev, jobDetails: details }));
  }, []);

  const setSelectedFile = React.useCallback((file: File | null) => {
    setState((prev) => ({ ...prev, selectedFile: file }));
  }, []);

  const setResumeS3Key = React.useCallback((key: string) => {
    setState((prev) => ({ ...prev, resumeS3Key: key }));
  }, []);

  const setResumeEvaluation = React.useCallback((id: string, evaluation: ResumeEvaluation) => {
    setState((prev) => ({ ...prev, resumeId: id, resumeEvaluation: evaluation }));
  }, []);

  const setProjectName = React.useCallback((name: string | null) => {
    setState((prev) => ({ ...prev, projectName: name }));
  }, []);

  const setLinkedinOptimization = React.useCallback((optimization: LinkedInOptimizationPayload) => {
    setState((prev) => ({ ...prev, linkedinOptimization: optimization }));
  }, []);

  const setParsedProfile = React.useCallback((profile: ParsedProfile) => {
    setState((prev) => ({ ...prev, parsedProfile: profile }));
  }, []);

  const setLinkedInAudit = React.useCallback((audit: LinkedInAudit | UnifiedLinkedInAudit) => {
    setState((prev) => ({ ...prev, linkedInAudit: audit }));
  }, []);

  const setResumeItem = React.useCallback((item: ResumeItem) => {
    setState((prev) => ({
      ...prev,
      resumeId: item.id,
      resumeS3Key: item.resumeS3Key ?? null,
      projectName: item.name ?? null,
      jobDetails: item.jobDetails ?? null,
      resumeEvaluation: item.resumeEvaluation ?? null,
      linkedinOptimization: item.linkedinOptimization ?? null,
      parsedProfile: item.parsedProfile ?? null,
      linkedInAudit: item.linkedInAudit ?? null,
      uploadError: null,
      evaluationError: null,
    }));
  }, []);

  const setIsUploading = React.useCallback((isUploading: boolean) => {
    setState((prev) => ({ ...prev, isUploading }));
  }, []);

  const setIsEvaluating = React.useCallback((isEvaluating: boolean) => {
    setState((prev) => ({ ...prev, isEvaluating }));
  }, []);

  const setUploadError = React.useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, uploadError: error }));
  }, []);

  const setEvaluationError = React.useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, evaluationError: error }));
  }, []);

  const resetState = React.useCallback(() => {
    setState(initialState);
  }, []);

  const contextValue: AppContextType = React.useMemo(
    () => ({
      ...state,
      setJobDetails,
      setSelectedFile,
      setResumeS3Key,
      setResumeEvaluation,
      setProjectName,
      setLinkedinOptimization,
      setParsedProfile,
      setLinkedInAudit,
      setResumeItem,
      setIsUploading,
      setIsEvaluating,
      setUploadError,
      setEvaluationError,
      resetState,
    }),
    [state, setJobDetails, setSelectedFile, setResumeS3Key, setResumeEvaluation, setProjectName, setLinkedinOptimization, setParsedProfile, setLinkedInAudit, setResumeItem, setIsUploading, setIsEvaluating, setUploadError, setEvaluationError, resetState]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
