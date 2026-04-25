import postService from "../services/postService.js";
import userRepository from "../repositories/userRepository.js";

class PostController {
    async create(req, res) {
        try {
            const { userId } = req.params;
            const post = await postService.createPost(userId, req.body);
            res.status(201).json(post);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const posts = await postService.getPosts();
            res.render("posts", { posts });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async showCreateForm(req, res) {
        try {
            const users = await userRepository.findAll();
            res.render("post-create", { users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async store(req, res) {
        try {
            const { userId, title, content, hashtags, imageUrl } = req.body;
            const hashtagsArray = hashtags ? hashtags.split(',').map(tag => tag.trim()) : [];

            await postService.createPost(userId, {
                title,
                content,
                hashtags: hashtagsArray,
                imageUrl
            });

            res.redirect("/posts");
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async showEditForm(req, res) {
        try {
            const { id } = req.params;
            const post = await postService.getPostById(id);
            const users = await userRepository.findAll();
            res.render("post-edit", { post, users });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, content, hashtags, imageUrl } = req.body;
            const hashtagsArray = hashtags ? hashtags.split(',').map(tag => tag.trim()) : [];

            await postService.updatePost(id, {
                title,
                content,
                hashtags: hashtagsArray,
                imageUrl
            });

            res.redirect("/posts");
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await postService.deletePost(id);
            res.redirect("/posts");
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PostController();

