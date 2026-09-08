/**
 * Zustand store — persists user's skills across pages.
 * Used by: Resume → Roadmap → Chat → Career Recommend.
 */
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SkillsState {
  skills: string[];
  setSkills: (skills: string[]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  clearSkills: () => void;
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set) => ({
      skills: [],
      setSkills: (skills) => set({ skills }),
      addSkill: (skill) =>
        set((state) => ({
          skills: state.skills.includes(skill)
            ? state.skills
            : [...state.skills, skill],
        })),
      removeSkill: (skill) =>
        set((state) => ({
          skills: state.skills.filter((s) => s !== skill),
        })),
      clearSkills: () => set({ skills: [] }),
    }),
    { name: "vidyavani-skills" }
  )
);
