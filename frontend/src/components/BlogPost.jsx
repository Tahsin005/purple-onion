import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { blogApi } from '../services/api';
import { ArrowUp, TriangleAlert, Clock } from 'lucide-react';
import './BlogPost.css';
import 'highlight.js/styles/github-dark.css';

const BlogPost = ({ slug, onBack }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchPost = async () => {
        try {
            setLoading(true);
            const data = await blogApi.getBySlug(slug);
            setPost(data);
        } catch (err) {
            console.error('Failed to fetch post:', err);
            setError('Failed to load blog post');
        } finally {
            setLoading(false);
        }
    };

    const getCanonicalUrl = () => {
        return `${window.location.origin}/post/${slug}`;
    };

    if (loading) {
        return (
            <div className="blog-post">
                <div className="skeleton-back-btn shimmer"></div>

                <div className="blog-post-skeleton">
                    <div className="skeleton-hero shimmer"></div>

                    <div className="blog-post-content">
                        <header className="blog-post-header">
                            <div className="skeleton-title shimmer"></div>
                            <div className="skeleton-meta shimmer"></div>
                        </header>

                        <div className="blog-post-body">
                            <div className="skeleton-divider shimmer"></div>
                            <div className="skeleton-heading shimmer"></div>
                            <div className="skeleton-paragraph">
                                <div className="skeleton-line shimmer"></div>
                                <div className="skeleton-line shimmer"></div>
                                <div className="skeleton-line shimmer"></div>
                                <div className="skeleton-line shimmer" style={{ width: '60%' }}></div>
                            </div>

                            <div className="skeleton-paragraph" style={{ marginTop: '2rem' }}>
                                <div className="skeleton-line shimmer"></div>
                                <div className="skeleton-line shimmer"></div>
                                <div className="skeleton-line shimmer" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="blog-post">
                <button onClick={onBack} className="back-button">
                    
                </button>
                <div className="error-state">
                    <div className="error-icon-container">
                        <TriangleAlert
                            size={64}
                            className="error-alert-icon"
                            strokeWidth={2.5}
                        />
                    </div>
                    <h2>Oops! Post not found</h2>
                    <p>{error || 'The post you are looking for does not exist.'}</p>
                    <button onClick={onBack} className="btn btn-primary">
                        Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-post">
            <Helmet>
                <title>{post.title} - Purple Onion</title>
                <meta name="description" content={post.excerpt} />
                <link rel="canonical" href={getCanonicalUrl()} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={getCanonicalUrl()} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                {post.images && post.images.length > 0 && (
                    <meta property="og:image" content={post.images[0].proxyURL} />
                )}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={getCanonicalUrl()} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt} />
                {post.images && post.images.length > 0 && (
                    <meta name="twitter:image" content={post.images[0].proxyURL} />
                )}
            </Helmet>

            <button onClick={onBack} className="back-button">
                
            </button>

            {post.images && post.images.length > 0 && (
                <div className="blog-post-hero">
                    <img
                        src={post.images[0].proxyURL}
                        alt={post.title}
                    />
                </div>
            )}

            <article className="blog-post-content">
                <header className="blog-post-header">
                    <h1 className="blog-post-title">{post.title}</h1>
                    <div className="blog-post-meta">
                        <span className="reading-time">
                            <Clock size={18} className="meta-icon" />
                            {post.readingTime} min read
                        </span>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                        <div className="blog-post-tags">
                            {post.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </header>

                <div className="blog-post-body">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                    >
                        {post.body}
                    </ReactMarkdown>
                </div>

                {post.images && post.images.length > 1 && (
                    <div className="blog-post-gallery">
                        <h3>Gallery</h3>
                        <div className="gallery-grid">
                            {post.images.slice(1).map((image, index) => (
                                <div key={index} className="gallery-item">
                                    <img
                                        src={image.proxyURL}
                                        alt={`${post.title} - Image ${index + 2}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            <button
                onClick={scrollToTop}
                className="scroll-top-btn"
                aria-label="Scroll to top"
            >
                <ArrowUp size={24} />
            </button>
        </div>
    );
};

export default BlogPost;
