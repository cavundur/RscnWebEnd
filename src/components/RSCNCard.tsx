import React from "react";
import clsx from "clsx";

interface RSCNCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "inform" | "support" | "promote" | "inspire" | "research";
}

const colorClass = {
  inform: "card-inform",
  support: "card-support",
  promote: "card-promote",
  inspire: "card-inspire",
  research: "card-research",
};

export default function RSCNCard({ icon, title, description, color }: RSCNCardProps) {
  return (
    <div className={clsx("rscn-card", colorClass[color])}>
      <div className="text-4xl mb-2">{icon}</div>
      <div className="font-bold mb-1">{title}</div>
      <div>{description}</div>
    </div>
  );
} 