
import React from 'react';
import { Button } from "@/components/ui/button";

type SectionLinkProps = {
  title: string;
  onNavigate: () => void;
  buttonText: string;
};

const SectionLink = ({ title, onNavigate, buttonText }: SectionLinkProps) => {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button onClick={onNavigate}>
          {buttonText}
        </Button>
      </div>
    </section>
  );
};

export default SectionLink;
