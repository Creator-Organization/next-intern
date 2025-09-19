"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, FileText, User, Bookmark, ArrowLeft, Clock, Calendar, AlertCircle, CheckCircle, MessageSquare, FileUp, Video } from 'lucide-react';

// Mock data for applications
const initialApplications = [
    { 
        id: 1, 
        title: "Web Development Intern", 
        status: "Assignment", 
        stage: 3,
        assignment: {
            task: "Build a simple to-do list application using React.",
            deadline: "2025-09-05T23:59:59"
        }
    },
    { 
        id: 3, 
        title: "Marketing Intern", 
        status: "Under Review", 
        stage: 2 
    },
    { 
        id: 4, 
        title: "AI/ML Intern", 
        status: "Applied", 
        stage: 1 
    },
    { 
        id: 5, 
        title: "UI/UX Design Intern", 
        status: "Offer Extended", 
        stage: 4 
    },
];

const statusSteps = ["Applied", "Under Review", "Assignment", "Offer"];

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState(initialApplications);

    const getDeadlineInfo = (deadline) => {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", color: "red" };
        if (diffDays === 0) return { text: "Due today", color: "red" };
        if (diffDays === 1) return { text: "Due tomorrow", color: "orange" };
        return { text: `Due in ${diffDays} days`, color: "green" };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-gray-800">
                        Creator<span className="text-blue-600"> Research</span>
                    </Link>
                    <Link href="/student" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                       <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-1/4">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Menu</h2>
                        <nav className="space-y-2">
                            <Link href="/student" className="flex items-center space-x-3 text-black hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors">
                                <Briefcase />
                                <span>All Internships</span>
                            </Link>
                            <Link href="/MyApplication" className="flex items-center space-x-3 text-blue-600 font-semibold border-l-4 border-blue-600 bg-blue-50 p-3 rounded-r-lg">
                                <FileText />
                                <span>My Applications</span>
                            </Link>
                             <Link href="#" className="flex items-center space-x-3 text-black hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors">
                                <Bookmark />
                                <span>Saved</span>
                            </Link>
                            <Link href="#" className="flex items-center space-x-3 text-black hover:text-blue-600 hover:bg-blue-50 p-3 rounded-lg transition-colors">
                                <User />
                                <span>My Profile</span>
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="w-full lg:w-3/4">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-black">My Applications</h1>
                        <p className="text-gray-700">Track the status of all your internship applications here.</p>
                    </div>

                    <div className="space-y-6">
                        {applications.map(app => {
                            const deadlineInfo = app.assignment ? getDeadlineInfo(app.assignment.deadline) : null;

                            return (
                                <div key={app.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold text-black mb-4">{app.title}</h2>
                                        
                                        {/* Status Stepper */}
                                        <div className="flex items-center mb-6">
                                            {statusSteps.map((step, index) => (
                                                <div key={step} className="flex items-center w-full">
                                                    <div className={`flex flex-col items-center ${index + 1 <= app.stage ? 'text-blue-600' : 'text-gray-400'}`}>
                                                        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${index + 1 <= app.stage ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-400'}`}>
                                                            {index + 1 < app.stage ? <CheckCircle size={20} /> : index + 1}
                                                        </div>
                                                        <p className="text-xs mt-1 text-center">{step}</p>
                                                    </div>
                                                    {index < statusSteps.length - 1 && <div className={`flex-auto border-t-2 ${index + 1 < app.stage ? 'border-blue-600' : 'border-gray-400'}`}></div>}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actionable Section */}
                                        {app.status === "Assignment" && (
                                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                                                <div className="flex items-center">
                                                    <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                                                    <div>
                                                        <h3 className="font-bold text-yellow-800">Assignment Task</h3>
                                                        <p className="text-sm text-yellow-700">{app.assignment.task}</p>
                                                        <div className={`mt-2 flex items-center text-sm font-semibold text-${deadlineInfo.color}-600`}>
                                                            <Clock className="h-4 w-4 mr-1" /> {deadlineInfo.text}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="mt-4 w-full sm:w-auto bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center">
                                                    <FileUp className="h-4 w-4 mr-2" /> Submit Assignment
                                                </button>
                                            </div>
                                        )}

                                        {app.status === "Offer Extended" && (
                                             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                                 <div className="flex items-center">
                                                     <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                                                     <div>
                                                         <h3 className="font-bold text-blue-800">Congratulations!</h3>
                                                         <p className="text-sm text-blue-700">You have received an offer for this position.</p>
                                                     </div>
                                                 </div>
                                                  <Link href={`/offer/${app.id}`} className="mt-4 inline-block w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                                                     View Offer
                                                  </Link>
                                             </div>
                                        )}

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}

