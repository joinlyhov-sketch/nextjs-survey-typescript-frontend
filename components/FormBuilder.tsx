"use client";

import { useEffect, useRef } from "react";
import {
  ICreatorOptions,
  ICreatorTheme,
  getLocaleStrings,
  registerCreatorTheme,
} from "survey-creator-core";
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-searchbox";
import SurveyCreatorTheme from "survey-creator-core/themes";
import { creatorTheme } from "../styles/form-builder-theme";
import { createPdfAction } from "../utils/surveyPdf";

registerCreatorTheme(SurveyCreatorTheme);

function addCustomTheme(theme: ICreatorTheme, name: string) {
  const en = getLocaleStrings("en");
  const themeName = theme.themeName || "customTheme";
  (en.creatortheme.names as Record<string, string>)[themeName] = name;
  registerCreatorTheme(theme);
}

addCustomTheme(creatorTheme, "Custom Theme");

const defaultOptions: ICreatorOptions = {
  showTranslationTab: true,
  showThemeTab: true,
  autoSaveEnabled: true,
};

export default function FormBuilderComponent(props: {
  onSaveSurvey: (json: object) => void;
  json?: object;
  surveyId?: string;
}) {
  const creatorRef = useRef<SurveyCreator | null>(null);

  // INIT CREATOR (ONLY ONCE)
  if (!creatorRef.current) {
    const creator = new SurveyCreator(defaultOptions);

    creator.saveSurveyFunc = (no, callback) => {
      props.onSaveSurvey(creator.JSON);
      callback(no, true);
    };

    creator.applyCreatorTheme(creatorTheme);
    createPdfAction(creator);

    creatorRef.current = creator;
  }

  const creator = creatorRef.current;

  // LOAD JSON INTO CREATOR
  useEffect(() => {
    if (props.json) {
      creator.JSON = props.json;
    }
  }, [props.json, creator]);

  // 🔥 HANDLE SUBMIT FROM PREVIEW
  useEffect(() => {
    const interval = setInterval(() => {
      const preview = creator.getPlugin("preview") as any;
      const survey = preview?.model?.survey;

      if (!survey) return;

      // prevent duplicate binding
      if (survey.__handlerAttached) return;

      survey.__handlerAttached = true;

      survey.onComplete.add(async (sender: any) => {
        try {
          const surveyId = localStorage.getItem("currentSurveyId");

          if (!surveyId) {
            alert("❌ No survey ID found. Please save survey first.");
            return;
          }

          const res = await fetch(
            `http://localhost:8080/api/surveys/${surveyId}/results`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(sender.data),
            },
          );

          if (!res.ok) throw new Error();

          alert("✅ Survey submitted!");
        } catch (err) {
          console.error(err);
          alert("❌ Submit failed");
        }
      });
    }, 1000); // wait until preview is ready

    return () => clearInterval(interval);
  }, [creator]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <SurveyCreatorComponent creator={creator} />
    </div>
  );
}
