import React from 'react';
import Card from '../components/common/Card';
import { Target, Zap, Globe, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">About Learn English</h1>
          <p className="text-xl text-gray-600">AI-Powered Education for Grade 3 Teachers</p>
        </div>

        {/* Mission Section */}
        <Card className="mb-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex gap-4 items-start">
            <Target className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To empower teachers with AI-generated, curriculum-aligned educational content that saves time, reduces workload, and improves student learning outcomes. We believe quality education should be accessible to every teacher and school, regardless of resources.
              </p>
            </div>
          </div>
        </Card>

        {/* Why We Built This */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Why We Built This</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-lg text-gray-800 mb-2">😩 The Problem</h3>
              <p className="text-gray-600">
                Teachers spend countless hours creating lesson plans, worksheets, and assessments. Quality educational content is expensive or time-consuming to develop.
              </p>
            </Card>
            <Card>
              <h3 className="font-bold text-lg text-gray-800 mb-2">✨ Our Solution</h3>
              <p className="text-gray-600">
                Instant, high-quality lesson generation using advanced AI, aligned with official curriculum, at a fraction of traditional costs.
              </p>
            </Card>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex gap-4">
              <Users className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Teacher-Centric</h4>
                <p className="text-gray-600 text-sm">Built by educators, for educators. We understand classroom challenges.</p>
              </div>
            </Card>

            <Card className="flex gap-4">
              <Zap className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Quality First</h4>
                <p className="text-gray-600 text-sm">Rigorous curriculum alignment and educational standards compliance.</p>
              </div>
            </Card>

            <Card className="flex gap-4">
              <Globe className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Accessible Education</h4>
                <p className="text-gray-600 text-sm">Affordable pricing that every school can use.</p>
              </div>
            </Card>

            <Card className="flex gap-4">
              <Target className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Continuous Improvement</h4>
                <p className="text-gray-600 text-sm">Always learning and improving based on feedback.</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Technology */}
        <Card className="mb-16 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Technology Behind Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-1">Claude AI</h4>
              <p className="text-sm text-gray-600">State-of-the-art language model for content generation</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-1">React & Tailwind</h4>
              <p className="text-sm text-gray-600">Modern web technologies for responsive design</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-1">Curriculum Database</h4>
              <p className="text-sm text-gray-600">Tamil Nadu Grade 3 English NCERT alignment</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-bold text-gray-800 mb-1">Document Generation</h4>
              <p className="text-sm text-gray-600">Professional Word document formatting</p>
            </div>
          </div>
        </Card>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Our Team</h2>
          <Card className="text-center">
            <p className="text-gray-600 mb-4">
              Built by a team of educators, software engineers, and instructional designers passionate about transforming education through technology.
            </p>
            <p className="text-gray-700 font-semibold">
              Headquarters: Tamil Nadu, India
            </p>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <Card className="text-center">
            <p className="text-3xl font-bold text-orange-600">10</p>
            <p className="text-gray-600 text-sm">Chapters</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-blue-600">60</p>
            <p className="text-gray-600 text-sm">Lessons</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-green-600">100%</p>
            <p className="text-gray-600 text-sm">Curriculum Aligned</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-purple-600">2025</p>
            <p className="text-gray-600 text-sm">Founded</p>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center space-y-4">
          <h2 className="text-2xl font-bold">Join Us in Transforming Education</h2>
          <p className="text-orange-100">Help us make quality educational content accessible to every teacher</p>
          <button className="bg-white text-orange-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors inline-block">
            Get Started Now
          </button>
        </Card>
      </div>
    </div>
  );
};

export default About;
