// src/app/candidate/certificates/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Award, Plus, ExternalLink, Trash2, Edit, Loader2, X, Calendar, Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialId: string | null;
  credentialUrl: string | null;
  isVerified: boolean;
  description: string | null;
  skills: string[];
}

const CertificatesPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetchedData = useRef(false);

  const [formData, setFormData] = useState({
    name: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '', description: '', skills: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (session?.user?.userType !== 'CANDIDATE') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (status !== 'authenticated' || !session?.user?.candidate?.id || hasFetchedData.current) return;
      hasFetchedData.current = true;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/candidates/${session.user.candidate.id}/certificates`);
        if (response.ok) {
          const data = await response.json();
          setCertificates(data.data || []);
        }
      } catch (error) {
        console.error('Error:', error);
        hasFetchedData.current = false;
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, [status, session?.user?.candidate?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({ name: '', issuer: '', issueDate: '', credentialId: '', credentialUrl: '', description: '', skills: '' });
    setEditingCertificate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.issuer.trim() || !formData.issueDate || !formData.credentialUrl.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        issueDate: formData.issueDate,
        expiryDate: null,
        credentialId: formData.credentialId.trim() || null,
        credentialUrl: formData.credentialUrl.trim(),
        description: formData.description.trim() || null,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      const url = editingCertificate 
        ? `/api/candidates/${session?.user?.candidate?.id}/certificates/${editingCertificate.id}`
        : `/api/candidates/${session?.user?.candidate?.id}/certificates`;
      const response = await fetch(url, {
        method: editingCertificate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        if (editingCertificate) {
          setCertificates(prev => prev.map(cert => cert.id === editingCertificate.id ? data.data : cert));
          toast.success('✅ Certificate updated successfully!', { duration: 4000, icon: '🎓' });
        } else {
          setCertificates(prev => [data.data, ...prev]);
          toast.success('🎉 Certificate added successfully!', { duration: 4000, icon: '🎓' });
        }
        setShowAddModal(false);
        resetForm();
      } else {
        toast.error('Failed to save certificate');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const response = await fetch(`/api/candidates/${session?.user?.candidate?.id}/certificates/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCertificates(prev => prev.filter(cert => cert.id !== id));
        toast.success('🗑️ Certificate deleted!', { duration: 3000 });
      } else {
        toast.error('Failed to delete');
      }
    } catch {
      toast.error('Error occurred');
    }
  };

  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const user = session?.user;
  const verifiedCount = certificates.filter(c => c.isVerified).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header user={user ? { id: user.id, email: user.email || '', userType: user.userType, candidate: user.name ? { firstName: user.name.split(' ')[0] || '', lastName: user.name.split(' ')[1] || '' } : undefined } : undefined} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-manrope mb-2">Certificates</h1>
                  <p className="text-gray-600">Manage your professional credentials</p>
                </div>
                <Button onClick={() => { resetForm(); setShowAddModal(true); }}><Plus className="h-4 w-4 mr-2" />Add Certificate</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{certificates.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Verified</p><p className="text-2xl font-bold text-green-600">{verifiedCount}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{certificates.length - verifiedCount}</p></CardContent></Card>
          </div>

          {certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Award className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{cert.name}</h3>
                          <p className="text-gray-600 mb-2">Issued by <span className="font-medium">{cert.issuer}</span></p>
                          {cert.description && <p className="text-sm text-gray-700 mb-2">{cert.description}</p>}
                          {cert.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {cert.skills.map((skill, i) => <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{skill}</span>)}
                            </div>
                          )}
                          <div className="flex gap-4 text-sm text-gray-600 items-center">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Issued: {formatDate(cert.issueDate)}</span>
                            </div>
                            <a href={cert.credentialUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-1">
                              View Certificate <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { 
                          setEditingCertificate(cert); 
                          setFormData({ 
                            name: cert.name, 
                            issuer: cert.issuer, 
                            issueDate: new Date(cert.issueDate).toISOString().split('T')[0], 
                            credentialId: cert.credentialId || '', 
                            credentialUrl: cert.credentialUrl || '', 
                            description: cert.description || '', 
                            skills: cert.skills.join(', ') 
                          }); 
                          setShowAddModal(true); 
                        }}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(cert.id, cert.name)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card><CardContent className="text-center py-16"><Award className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No Certificates</h3><p className="text-gray-600 mb-6">Add your first certificate</p><Button onClick={() => setShowAddModal(true)}><Plus className="h-4 w-4 mr-2" />Add Certificate</Button></CardContent></Card>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 font-manrope">{editingCertificate ? 'Edit' : 'Add New'} Certificate</h2>
                  <p className="text-gray-600 mt-1">Fill in your certificate details below</p>
                </div>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Upload className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-1">📤 Upload Your Certificate First</p>
                    <p className="text-blue-800">Upload your certificate to Google Drive, Dropbox, or any cloud storage, then paste the shareable link below in the <strong>Certificate URL</strong> field.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                      Certificate Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>

                  <div>
                    <label htmlFor="issuer" className="block text-sm font-bold text-gray-900 mb-2">
                      Issuing Organization *
                    </label>
                    <input
                      type="text"
                      id="issuer"
                      value={formData.issuer}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="issueDate" className="block text-sm font-bold text-gray-900 mb-2">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      id="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="credentialId" className="block text-sm font-bold text-gray-900 mb-2">
                      Credential ID (Optional)
                    </label>
                    <input
                      type="text"
                      id="credentialId"
                      value={formData.credentialId}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                      placeholder="e.g., ABC-123-XYZ"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="credentialUrl" className="block text-sm font-bold text-gray-900 mb-2">
                    Certificate URL * <span className="text-red-600">(Required)</span>
                  </label>
                  <input
                    type="url"
                    id="credentialUrl"
                    value={formData.credentialUrl}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  <p className="text-xs text-gray-500 mt-2">Paste the shareable link to your uploaded certificate (Google Drive, Dropbox, etc.)</p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                    placeholder="Brief description of what you learned..."
                  />
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-bold text-gray-900 mb-2">
                    Skills Gained (Optional)
                  </label>
                  <input
                    type="text"
                    id="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all disabled:opacity-50"
                    placeholder="e.g., Cloud Computing, AWS, DevOps (comma separated)"
                  />
                  <p className="text-xs text-gray-500 mt-2">Separate multiple skills with commas</p>
                </div>

                <div className="flex gap-4 pt-4 border-t-2">
                  <Button type="button" variant="secondary" onClick={() => { setShowAddModal(false); resetForm(); }} disabled={isSubmitting} className="flex-1 py-3 text-base">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-base">
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving...</>
                    ) : editingCertificate ? (
                      '✅ Update Certificate'
                    ) : (
                      '➕ Add Certificate'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CertificatesPage;