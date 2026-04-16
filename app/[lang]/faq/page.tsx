'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, CircleHelp, MessageCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FAQPage() {
  const t = useTranslations('faq');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/faqs/active');
      const data = (response as any).data || response;
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      toast.error(t('failedToLoad'));
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="page-container">
        <div className="page-section">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 border border-[rgba(255,255,255,0.07)] rounded-full px-5 py-2.5 mb-8">
              <CircleHelp className="w-4 h-4 text-[#51a2ff]" />
              <span className="text-sm font-medium text-[#888]">Help Center</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight tracking-tight text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-[#888] mb-10 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions about our platform, scripts, and services.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base w-full pl-12 h-12"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="max-w-3xl mx-auto space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-2 border-[rgba(255,255,255,0.07)] border-t-[#51a2ff] rounded-full animate-spin mx-auto"></div>
                <p className="text-[#888] mt-4">Loading FAQs...</p>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="card-base p-12 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-[#555]" />
                </div>
                <p className="text-white font-semibold mb-1">No FAQs found</p>
                <p className="text-[#555]">Try adjusting your search</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="card-base overflow-hidden transition-all duration-200 hover:border-[rgba(81,162,255,0.3)]"
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-start p-5 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
                      <CircleHelp className="w-5 h-5 text-[#51a2ff]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-base font-semibold text-white">{faq.question}</h3>
                        <div className="flex-shrink-0 w-7 h-7 rounded-md bg-[#1a1a1a] flex items-center justify-center">
                          {expandedId === faq.id ? (
                            <ChevronUp className="w-4 h-4 text-[#51a2ff]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#555]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  {expandedId === faq.id && (
                    <div className="px-5 pb-5 pl-[4.75rem]">
                      <div className="border-l-2 border-[rgba(81,162,255,0.3)] pl-4">
                        <p className="text-[#aaa] leading-relaxed whitespace-pre-wrap text-sm">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact CTA */}
          <div className="max-w-3xl mx-auto mt-16">
            <div className="card-featured p-8 sm:p-10 text-center">
              <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto mb-5">
                <CircleHelp className="w-7 h-7 text-[#51a2ff]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Still have questions?</h3>
              <p className="text-[#888] mb-6 max-w-md mx-auto">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <a href="/contact" className="btn-primary inline-flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
