import { createContext, useContext } from "react";
import { portfolioData } from "../data/portfolioData";
import { builtInExperience } from "./experience";

export const baseContent = {
  projects: portfolioData.projects,
  resumes: portfolioData.personalInfo.resumes,
  certifications: portfolioData.certifications,
  experience: builtInExperience,
};

export const ContentContext = createContext(baseContent);

export const useContent = () => useContext(ContentContext);
