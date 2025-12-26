import React from "react";
import { RefreshCcw, X, Check, RotateCw, Play } from "lucide-react";

export const IconRestart = ({ className }) => (
  <RefreshCcw className={className} />
);
export const IconClose = ({ className }) => <X className={className} />;
export const IconCheck = ({ className }) => <Check className={className} />;
export const IconRotate = ({ className }) => <RotateCw className={className} />;
export const IconPlay = ({ className }) => <Play className={className} />;
