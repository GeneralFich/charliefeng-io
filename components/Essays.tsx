import React, { useState } from 'react';
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

  React.useEffect(() => {
    if (initialSlug) {
      const post = BLOG_POSTS.find(p => p.slug === initialSlug);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [initialSlug]);

  if (selectedPost) {
    return (
      <EssayDetail
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
        onNavigate={setSelectedPost}
      />
    );
  }

  return (
    <EssayList
      onSelectPost={setSelectedPost}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      sortBy={sortBy}
      setSortBy={setSortBy}
    />
  );
};
