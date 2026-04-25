import postRepository from "../repositories/postRepository.js";
import userRepository from "../repositories/userRepository.js";

class PostService {
    async createPost(userId, postData) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        return await postRepository.create({ ...postData, user: user._id });
    }

    async getPosts() {
        return await postRepository.findAll();
    }

    async getPostsByUser(userId) {
        return await postRepository.findByUser(userId);
    }

    async getPostById(postId) {
        return await postRepository.findById(postId);
    }

    async updatePost(postId, postData) {
        postData.updatedAt = new Date();
        return await postRepository.update(postId, postData);
    }

    async deletePost(postId) {
        return await postRepository.delete(postId);
    }
}

export default new PostService();
