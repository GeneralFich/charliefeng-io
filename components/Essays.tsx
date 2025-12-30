import React, { useState, useMemo } from 'react';
import { BLOG_POSTS, BlogPost } from '../lib/knowledge';
import { EssayList, SortOption } from './EssayList';
import { EssayDetail } from './EssayDetail';

interface EssaysProps {
  initialSlug?: string | null;
}

export const Essays: React.FC<EssaysProps> = ({ initialSlug }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Handle initial slug prop
  React.useEffect(() => {
    if (initialSlug) {
      const post = BLOG_POSTS.find(p => p.slug === initialSlug);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialSlug]);

  // Filter and sort posts for the main list
  // Kept in parent to preserve context for navigation between posts
  const filteredPosts = useMemo(() => {
    let posts = BLOG_POSTS;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      posts = posts.filter(post => post.searchContent.includes(lowerQuery));
    }

    // Optimization: BLOG_POSTS is already sorted by newest (descending date).
    switch (sortBy) {
      case 'newest':
        return posts;
      case 'oldest':
        // Reverse is faster than sorting, and posts is already sorted by newest
        return [...posts].reverse();
      case 'shortest':
        return [...posts].sort((a, b) => a.readTime - b.readTime);
      case 'longest':
        return [...posts].sort((a, b) => b.readTime - a.readTime);
      default:
        return posts;
    }
  }, [searchQuery, sortBy]);

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    // Update URL silently
    const url = new URL(window.location.href);
    url.searchParams.set('essay', post.slug);
    window.history.pushState({}, '', url.toString());
  };

  const handleBack = () => {
    setSelectedPost(null);
    // Clear URL param when going back
    const url = new URL(window.location.href);
    url.searchParams.delete('essay');
    window.history.pushState({}, '', url.toString());
  };

  const handleNavigate = (post: BlogPost) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update URL silently
    const url = new URL(window.location.href);
    url.searchParams.set('essay', post.slug);
    window.history.pushState({}, '', url.toString());
  };

  if (selectedPost) {
    return (
      <EssayDetail
        post={selectedPost}
        filteredPosts={filteredPosts}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <EssayList
      posts={filteredPosts}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortBy={sortBy}
      onSortChange={setSortBy}
      onSelectPost={handleSelectPost}
    />
  );
};
