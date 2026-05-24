import { useState, useEffect } from 'react';
import { TriangleAlert, Clock } from 'lucide-react';
import { blogApi } from '../services/api';
import './BlogList.css';

const BlogList = ({ onPostClick }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await blogApi.getAll();
            setPosts(data);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('Failed to load blog posts');
        } finally {
            setLoading(false);
        }
    };


    const extractImageFromBody = (body) => {
        if (!body) return null;
        const imageRegex = /!\[.*?\]\((.*?)\)/;
        const match = body.match(imageRegex);
        return match ? match[1] : null;
    };

    const cleanBody = (body) => {
        if (!body) return '';
        return body.replace(/!\[.*?\]\(.*?\)/, '').trim();
    };

    if (loading) {
        return (
            <div className="blog-list">
                <div className="blog-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="blog-card skeleton">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                                <div className="skeleton-title"></div>
                                <div className="skeleton-text"></div>
                                <div className="skeleton-text"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <div className="error-icon-container">
                    <TriangleAlert
                        size={64}
                        className="error-alert-icon"
                        strokeWidth={2.5}
                    />
                </div>
                <h2>Oops! Something went wrong</h2>
                <p>{error}</p>
                <button onClick={fetchPosts} className="btn btn-primary">
                    Try Again
                </button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h2>No posts yet</h2>
                <p>Start writing by posting in your Discord blog channel!</p>
            </div>
        );
    }

    return (
        <div className="blog-list">
            <div className="blog-grid">
                {posts.map((post, index) => {
                    const extractedImage = extractImageFromBody(post.body);
                    const featuredImage = post.images && post.images.length > 0
                        ? post.images[0].proxyURL
                        : extractedImage;

                    const postNumber = posts.length - index;

                    return (
                        <article
                            key={post.slug}
                            className="blog-card"
                            onClick={() => onPostClick(post.slug)}
                        >
                            <div className="blog-card-number">{postNumber}</div>
                            {featuredImage && (
                                <div className="blog-card-image">
                                    <img
                                        src={featuredImage}
                                        alt={post.title}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                            <div className="blog-card-content">
                                <h2 className="blog-card-title">{post.title}</h2>
                                <div className="blog-card-meta">
                                    <span className="reading-time">
                                        <Clock size={16} className="meta-icon" />
                                        {post.readingTime} min read
                                    </span>
                                </div>

                                {post.excerpt && (
                                    <p className="blog-card-excerpt">{post.excerpt}</p>
                                )}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="blog-card-tags">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="tag">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};

export default BlogList;
