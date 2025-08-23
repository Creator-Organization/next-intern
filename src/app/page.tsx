'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';

export default function Home() {
  const { theme, setTheme, themes } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: 'frontend',
    experience: 'intermediate',
    skills: '',
    coverLetter: '',
    agreeToTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardHeader>
            <CardTitle className="font-manrope text-4xl font-bold text-primary-800">
              NextIntern Design System
            </CardTitle>
            <CardDescription className="text-lg text-primary-600">
              Complete theme system with Teal-Cyan, Blue, and Purple-Indigo color schemes
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Theme Switcher */}
        <Card variant="elevated" className="border-primary-200">
          <CardHeader>
            <CardTitle className="text-primary-700 font-manrope">
              Theme Selector: <span className="capitalize">{theme}</span>
            </CardTitle>
            <CardDescription>
              {themes.find(t => t.value === theme)?.description} • Switch themes to see live changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.value}
                  variant={theme === themeOption.value ? 'primary' : 'secondary'}
                  onClick={() => setTheme(themeOption.value)}
                  size="md"
                  className={`transition-all duration-200 ${
                    theme === themeOption.value 
                      ? 'bg-primary hover:bg-primary-hover shadow-lg scale-105 border-primary-300' 
                      : 'hover:border-primary-200 hover:bg-primary-50'
                  }`}
                >
                  {themeOption.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Button Showcase */}
          <Card variant="default" className="border-primary-200">
            <CardHeader>
              <CardTitle className="text-primary-700 font-manrope">Button System</CardTitle>
              <CardDescription>Complete button variants with themed colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Primary Button Variants */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Primary Variants
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-primary hover:bg-primary-hover">Primary</Button>
                    <Button className="bg-primary-light hover:bg-primary">Light Primary</Button>
                    <Button variant="ghost" className="text-primary-600 hover:bg-primary-50 border border-primary-200">
                      Ghost Primary
                    </Button>
                  </div>
                </div>

                {/* Semantic Colors */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Semantic States
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-[rgb(var(--success))] hover:opacity-90 text-white shadow-md">
                      ✓ Success
                    </Button>
                    <Button className="bg-[rgb(var(--error))] hover:opacity-90 text-white shadow-md">
                      ✕ Error
                    </Button>
                    <Button className="bg-[rgb(var(--warning))] hover:opacity-90 text-white shadow-md">
                      ⚠ Warning
                    </Button>
                  </div>
                </div>

                {/* Accent Colors */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    Accent Colors
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-[rgb(var(--accent-1))] hover:opacity-90 text-white">Accent 1</Button>
                    <Button className="bg-[rgb(var(--accent-2))] hover:opacity-90 text-white">Accent 2</Button>
                    <Button className="bg-[rgb(var(--accent-3))] hover:opacity-90 text-white">Accent 3</Button>
                  </div>
                </div>

                {/* Interactive States */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Interactive States
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button size="sm" className="bg-primary hover:bg-primary-hover">Small</Button>
                    <Button size="md" className="bg-primary hover:bg-primary-hover">Medium</Button>
                    <Button size="lg" className="bg-primary hover:bg-primary-hover col-span-2">Large Button</Button>
                  </div>
                  <div className="flex gap-3">
                    <Button loading className="bg-primary">Loading State</Button>
                    <Button disabled className="bg-primary opacity-50">Disabled</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Card Showcase */}
          <Card variant="default" className="border-primary-200">
            <CardHeader>
              <CardTitle className="text-primary-700 font-manrope">Card System</CardTitle>
              <CardDescription>Responsive card variants with themed styling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card variant="default" padding="sm" className="border-primary-200 bg-gradient-to-br from-white to-primary-50">
                  <CardTitle className="text-base text-primary-600 flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                    Default Card
                  </CardTitle>
                  <CardDescription>Standard card with gradient background</CardDescription>
                </Card>

                <Card variant="interactive" padding="sm" className="hover:border-primary-300 hover:shadow-xl">
                  <CardTitle className="text-base text-primary-700 flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-600 rounded-full animate-pulse"></span>
                    Interactive Card
                  </CardTitle>
                  <CardDescription>Hover to see enhanced lift effect</CardDescription>
                </Card>

                <Card variant="elevated" padding="sm" className="bg-primary-100 border-primary-300">
                  <CardTitle className="text-base text-primary-800 flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-700 rounded-full"></span>
                    Themed Card
                  </CardTitle>
                  <CardDescription className="text-primary-600">Primary-100 background with themed text</CardDescription>
                </Card>

                <Card variant="bordered" padding="sm" className="border-2 border-primary-200 hover:border-primary-400">
                  <CardTitle className="text-base text-primary-700 flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-600 rounded-full"></span>
                    Bordered Card
                  </CardTitle>
                  <CardDescription>Thick themed border with hover states</CardDescription>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Color Palette */}
        <Card variant="elevated" className="border-primary-200">
          <CardHeader>
            <CardTitle className="text-primary-700 font-manrope text-2xl">Complete Color System</CardTitle>
            <CardDescription className="text-lg">
              <span className="font-medium text-primary-600">{themes.find(t => t.value === theme)?.label}</span> 
              • {themes.find(t => t.value === theme)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Primary Scale with Better Labels */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Primary Scale</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="space-y-2">
                      <div 
                        className={`h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold transition-transform hover:scale-105 cursor-pointer ${
                          shade >= 500 ? 'text-white border-white/20' : 'text-gray-800 border-gray-200'
                        }`}
                        style={{ backgroundColor: `rgb(var(--primary-${shade}))` }}
                      >
                        <span>{shade}</span>
                        {shade === 500 && <span className="text-xs opacity-80">MAIN</span>}
                      </div>
                      <div className="text-xs text-center text-gray-500 font-medium">
                        {shade === 50 ? 'Backgrounds' : 
                         shade === 100 ? 'Surfaces' :
                         shade === 200 ? 'Borders' :
                         shade === 500 ? 'Primary' :
                         shade === 600 ? 'Hover' :
                         shade === 700 ? 'Active' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Semantic Colors */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Semantic Colors</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Success', var: '--success', icon: '✓', desc: 'Positive actions' },
                    { name: 'Error', var: '--error', icon: '✕', desc: 'Negative feedback' },
                    { name: 'Warning', var: '--warning', icon: '⚠', desc: 'Caution states' }
                  ].map((color) => (
                    <div key={color.name} className="space-y-1">
                      <div 
                        className="h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                        style={{ backgroundColor: `rgb(var(${color.var}))` }}
                      >
                        {color.icon} {color.name}
                      </div>
                      <p className="text-xs text-gray-500 text-center">{color.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Accent Colors */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Accent Colors</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Accent 1', var: '--accent-1', desc: 'Highlights' },
                    { name: 'Accent 2', var: '--accent-2', desc: 'Secondary brand' },
                    { name: 'Accent 3', var: '--accent-3', desc: 'Deep accents' }
                  ].map((color) => (
                    <div key={color.name} className="space-y-1">
                      <div 
                        className="h-14 rounded-lg flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform cursor-pointer"
                        style={{ backgroundColor: `rgb(var(${color.var}))` }}
                      >
                        {color.name}
                      </div>
                      <p className="text-xs text-gray-500 text-center">{color.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gray Scale */}
            <div className="mt-8 pt-8 border-t border-primary-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">Gray Scale System</h4>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { shade: 50, usage: 'Page backgrounds', role: 'Base' },
                  { shade: 100, usage: 'Card surfaces', role: 'Surface' },
                  { shade: 500, usage: 'Secondary text', role: 'Text-2' },
                  { shade: 900, usage: 'Primary text', role: 'Text-1' }
                ].map((gray) => (
                  <div key={gray.shade} className="space-y-2">
                    <div 
                      className={`h-16 rounded-lg border-2 flex flex-col items-center justify-center font-bold transition-transform hover:scale-105 cursor-pointer ${
                        gray.shade >= 500 ? 'text-white border-white/20' : 'text-gray-800 border-gray-200'
                      }`}
                      style={{ backgroundColor: `rgb(var(--gray-${gray.shade}))` }}
                    >
                      <span>Gray {gray.shade}</span>
                      <span className="text-xs opacity-80">{gray.role}</span>
                    </div>
                    <div className="text-xs text-center text-gray-500 font-medium">{gray.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6 border-t border-primary-100">
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50 border border-primary-200">
                🎨 Export Palette
              </Button>
              <Button variant="secondary" size="sm" className="hover:border-primary-200">
                📖 View Documentation
              </Button>
              <Button variant="secondary" size="sm" className="hover:border-primary-200">
                💾 Save Config
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Enhanced Typography & Interactive Elements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary-200">
            <CardHeader>
              <CardTitle className="font-manrope text-primary-700 text-xl">Typography System</CardTitle>
              <CardDescription>Inter + Manrope font pairing with themed colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h1 className="font-manrope text-3xl font-bold text-primary-800">Heading 1 - Manrope Bold</h1>
                <h2 className="font-manrope text-2xl font-semibold text-primary-700">Heading 2 - Manrope Semi</h2>
                <h3 className="font-manrope text-xl font-medium text-primary-600">Heading 3 - Manrope Medium</h3>
                <p className="text-gray-900 leading-relaxed">Body text using Inter font family for optimal readability. This demonstrates how the typography system maintains consistency across different themes.</p>
                <p className="text-gray-500 text-sm">Secondary text in gray-500 for less important information and descriptions.</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <p className="text-primary-700 font-medium">📝 Typography scales beautifully across all three themes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary-200">
            <CardHeader>
              <CardTitle className="text-primary-700 font-manrope text-xl">Interactive Elements</CardTitle>
              <CardDescription>Hover and focus state demonstrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">🎯 Interactive Demo Zone:</div>
                <div className="p-4 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 hover:border-primary-300 transition-all cursor-pointer hover:shadow-md">
                  <p className="text-primary-700 font-medium">Hover for background transition</p>
                  <p className="text-primary-600 text-sm">Background: primary-50 → primary-100</p>
                </div>
                <div className="p-4 bg-white hover:bg-primary-50 rounded-lg border hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1">
                  <p className="text-gray-800 font-medium">Hover for lift effect</p>
                  <p className="text-gray-600 text-sm">Includes shadow and transform</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-lg cursor-pointer hover:from-primary-500 hover:to-primary-700 transition-all text-center font-medium">
                    Gradient
                  </div>
                  <div className="p-3 bg-[rgb(var(--accent-1))] text-white rounded-lg cursor-pointer hover:opacity-80 transition-all text-center font-medium">
                    Accent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Form Components */}
        <Card variant="elevated" className="border-primary-200">
          <CardHeader>
            <CardTitle className="text-primary-700 font-manrope text-2xl">Form Component System</CardTitle>
            <CardDescription className="text-lg">
              Interactive form elements with real-time theme switching and validation states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Basic Inputs */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                    Basic Form Elements
                  </h4>
                  <div className="space-y-4">
                    <Input 
                      label="Full Name" 
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                    />
                    <Input 
                      label="Email Address" 
                      type="email" 
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Position Type</label>
                      <select 
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary hover:border-primary-300 transition-all bg-white"
                      >
                        <option value="frontend">Frontend Developer</option>
                        <option value="backend">Backend Developer</option>
                        <option value="fullstack">Full Stack Developer</option>
                        <option value="design">UI/UX Designer</option>
                        <option value="data">Data Analyst</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    Input States Demo
                  </h4>
                  <div className="space-y-4">
                    <Input 
                      label="✓ Success State" 
                      placeholder="This field is valid"
                      className="border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                      value="Valid input"
                    />
                    <Input 
                      label="✕ Error State" 
                      error="This field is required"
                      placeholder="Invalid input"
                      className="border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                    />
                    <Input 
                      label="🔒 Disabled State" 
                      placeholder="Cannot interact"
                      disabled
                      value="Read-only content"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Advanced Forms */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Advanced Form Elements
                  </h4>
                  <div className="space-y-4">
                    <Textarea
                      label="Cover Letter"
                      placeholder="Tell us about your experience and why you're interested..."
                      value={formData.coverLetter}
                      onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                      className="min-h-[100px] focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all resize-none"
                    />
                    <Input 
                      label="Skills & Technologies" 
                      placeholder="React, TypeScript, Node.js, Python..."
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                    />

                    {/* Experience Level Radio */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Experience Level</label>
                      <div className="flex gap-6">
                        {[
                          { value: 'beginner', label: '🌱 Beginner' },
                          { value: 'intermediate', label: '🚀 Intermediate' },
                          { value: 'advanced', label: '⭐ Advanced' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="experience"
                              value={option.value}
                              checked={formData.experience === option.value}
                              onChange={(e) => handleInputChange('experience', e.target.value)}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
                    Theme Focus Demo
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <p className="text-sm text-primary-700 mb-3 font-medium">
                        💡 Focus on the input below to see themed focus ring:
                      </p>
                      <Input 
                        placeholder="Focus me to see the themed ring color!"
                        className="focus:border-primary focus:ring-2 focus:ring-primary-300 hover:border-primary-300 transition-all"
                      />
                      <p className="text-xs text-primary-600 mt-2">Ring color changes with your selected theme</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sample Form */}
            <div className="mt-8 pt-8 border-t border-primary-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <span className="w-4 h-4 bg-primary-600 rounded-full"></span>
                Complete Internship Application Form
              </h4>
              <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border-2 border-primary-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="🏢 Company Name" 
                    placeholder="Google, Microsoft, Startup Inc..."
                    className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                  />
                  <Input 
                    label="💼 Position Title" 
                    placeholder="Software Engineering Intern"
                    className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                  />
                  <Input 
                    label="💰 Expected Stipend" 
                    placeholder="₹25,000/month"
                    className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                  />
                  <Input 
                    label="📍 Preferred Location" 
                    placeholder="Bangalore, Remote, Hybrid..."
                    className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                  />
                </div>
                
                <div className="mt-6">
                  <Textarea
                    label="🎯 Why are you interested in this internship?"
                    placeholder="Share your motivation, goals, and what you hope to learn from this experience..."
                    className="focus:border-primary focus:ring-primary-200 hover:border-primary-300 transition-all"
                    rows={4}
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="mt-6 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                    I agree to the <span className="text-primary-600 font-medium cursor-pointer hover:underline">Terms and Conditions</span> and <span className="text-primary-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button 
                    className="bg-primary hover:bg-primary-hover shadow-md"
                    disabled={!formData.agreeToTerms}
                  >
                    🚀 Submit Application
                  </Button>
                  <Button variant="secondary" className="hover:border-primary-200 hover:bg-primary-50">
                    💾 Save as Draft
                  </Button>
                  <Button variant="ghost" className="text-primary-600 hover:bg-primary-50 border border-primary-200">
                    📋 Preview
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
