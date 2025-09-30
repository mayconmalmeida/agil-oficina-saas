
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

type SectionLinkProps = {
  title: string;
  onNavigate: () => void;
  buttonText: string;
  description?: string;
  icon?: React.ReactNode;
};

const SectionLink = ({ title, onNavigate, buttonText, description, icon }: SectionLinkProps) => {
  return (
    <Card className="hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 flex items-center justify-center gap-2 group-hover:bg-blue-700 transition-colors"
          variant="default"
        >
          {buttonText}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SectionLink;
