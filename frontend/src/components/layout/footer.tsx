import { BrainCircuit } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-gray-900">EduTech AI</span>
          </div>
          <p className="text-sm text-gray-600">
            Empowering students from Class 5 to 10 with personalized AI-driven learning.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-900">Platform</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>AI Tutor</li>
            <li>Interactive Quizzes</li>
            <li>Performance Analytics</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-900">Company</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>About Us</li>
            <li>Careers</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} EduTech AI Platform. All rights reserved.
      </div>
    </footer>
  );
}
