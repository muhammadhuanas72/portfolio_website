import { createContext, useContext } from "react";
import { portfolioData } from "../data/portfolioData";

export const baseContent = {
  projects: portfolioData.projects,
  resumes: portfolioData.personalInfo.resumes,
  certifications: portfolioData.certifications,
};

export const ContentContext = createContext(baseContent);

export const useContent = () => useContext(ContentContext);
