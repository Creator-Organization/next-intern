"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Clock, Wallet, Check, ArrowLeft, Info, AlertTriangle, X } from 'lucide-react';

// Mock data - in a real app, you would fetch this based on the ID from the URL
const internshipDetails = {
    id: 1,
    title: "Web Development Intern",
    stipend: "₹8000/month",
    duration: "3 months",
    description: "Join our dynamic team to build and maintain cutting-edge web applications. You will work with modern technologies and contribute to real-world projects, gaining invaluable hands-on experience in the software development lifecycle.",
    responsibilities: [
        "Collaborate with the development team to design and implement new features.",
        "Write clean, maintainable, and efficient code.",
        "Participate in code reviews to maintain code quality.",
        "Troubleshoot and debug applications."
    ],
    skillsRequired: [
        "Proficiency in HTML, CSS, and JavaScript.",
        "Experience with a modern JavaScript framework (React, Vue, or Angular).",
        "Understanding of RESTful APIs.",
        "Basic knowledge of Git and version control."
    ],
    learningOutcomes: [
        "Real-world experience in a professional development environment.",
        "Deep understanding of the full software development lifecycle.",
        "Improved coding and problem-solving skills.",
        "Opportunity to build a professional network."
    ]
};

export default function ApplicationPage({ params }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showForm, setShowForm] = useState(false); // State to control form visibility
    const [domainKnowledge, setDomainKnowledge] = useState(5);
    const [skillKnowledge, setSkillKnowledge] = useState(5);
    const [formData, setFormData] = useState({
        domain: '',
        priorProjects: '',
        pastInternships: '',
        achievements: '',
        technicalEvents: '',
    });

    useEffect(() => {
        // Prevent background scroll when modal is open
        if (showForm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [showForm]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Log form data to console for now
        console.log({
            domainKnowledge,
            skillKnowledge,
            ...formData
        });
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            setShowForm(false); // Close the modal on successful submission
        }, 2000);
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-gray-800">
                            Creator<span className="text-blue-600"> Research</span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <Link href="/student" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors flex items-center">
                               <ArrowLeft className="h-4 w-4 mr-2" /> Back to Internships
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column: Internship Details */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{internshipDetails.title}</h1>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-600 mb-6">
                                <div className="flex items-center"><Briefcase className="h-4 w-4 mr-2" /> Full-time</div>
                                <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {internshipDetails.duration}</div>
                                <div className="flex items-center"><Wallet className="h-4 w-4 mr-2" /> {internshipDetails.stipend}</div>
                            </div>

                            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">About the Internship</h2>
                            <p className="text-gray-600 leading-relaxed">{internshipDetails.description}</p>
                            
                            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Key Responsibilities</h2>
                            <ul className="space-y-2 text-gray-600 list-inside">
                                {internshipDetails.responsibilities.map((item, index) => (
                                    <li key={index} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />{item}</li>
                                ))}
                            </ul>

                            <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Skills Required</h2>
                            <ul className="space-y-2 text-gray-600 list-inside">
                                {internshipDetails.skillsRequired.map((item, index) => (
                                    <li key={index} className="flex items-start"><Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Column: Application CTA */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-lg shadow-md sticky top-24">
                                {isSubmitted ? (
                                    <div className="text-center">
                                        <Check className="h-16 w-16 mx-auto text-white bg-green-500 rounded-full p-2" />
                                        <h2 className="text-2xl font-bold text-gray-800 mt-4">Application Submitted!</h2>
                                        <p className="text-gray-600 mt-2">We have received your application. We will get back to you soon.</p>
                                        <Link href="/student" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                            Back to Dashboard
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Start Your Application</h2>
                                        <p className="text-gray-600 mb-8">Ready to take the next step? Fill out the application to be considered for this role.</p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                                        >
                                            Apply Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Application Form Modal */}
            {showForm && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-black mb-4">Your Application</h2>
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                            <p className="font-bold">Important:</p>
                            <p className="text-sm">Ensure all information is correct. Do not provide false details.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Skill Rating */}
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">Rate Your Domain Knowledge (1-10)</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="1" max="10" value={domainKnowledge} onChange={(e) => setDomainKnowledge(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                    <span className="font-bold text-black w-8 text-center">{domainKnowledge}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">Rate Your Skill Knowledge (1-10)</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="1" max="10" value={skillKnowledge} onChange={(e) => setSkillKnowledge(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                    <span className="font-bold text-black w-8 text-center">{skillKnowledge}</span>
                                </div>
                            </div>

                            {/* Domain Text Input */}
                            <div>
                                <label htmlFor="domain" className="block text-sm font-semibold text-black">Your Primary Domain</label>
                                <input
                                    type="text"
                                    id="domain"
                                    value={formData.domain}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                    placeholder="e.g., Frontend Development, Data Science"
                                />
                            </div>
                            
                            {/* Text Fields */}
                            <div>
                                <label htmlFor="priorProjects" className="block text-sm font-semibold text-black">Prior Projects</label>
                                <textarea id="priorProjects" value={formData.priorProjects} onChange={handleInputChange} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900" placeholder="Title and a short description of what you did."></textarea>
                            </div>

                            <div>
                                <label htmlFor="pastInternships" className="block text-sm font-semibold text-black">Past Internships (if any)</label>
                                <textarea id="pastInternships" value={formData.pastInternships} onChange={handleInputChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900" placeholder="Describe your role and responsibilities."></textarea>
                            </div>
                            
                            <div>
                                <label htmlFor="achievements" className="block text-sm font-semibold text-black">Achievements / Certifications / Research</label>
                                <textarea id="achievements" value={formData.achievements} onChange={handleInputChange} rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900" placeholder="List any relevant achievements or certifications."></textarea>
                            </div>

                            <div>
                                <label htmlFor="technicalEvents" className="block text-sm font-semibold text-black">Technical Events Attended</label>
                                <textarea id="technicalEvents" value={formData.technicalEvents} onChange={handleInputChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900" placeholder="e.g., Hackathons, Workshops, etc."></textarea>
                            </div>
                            
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

