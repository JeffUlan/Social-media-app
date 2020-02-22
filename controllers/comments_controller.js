const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
module.exports.create = async (req,res)=>{
    //find if the post exist 
    //post id is hidden input in home.ejs form
    try
    {
        let post = await Post.findById(req.body.post);
        if (post)
        {
            let comment = await Comment.create({
                content: req.body.content,
                post: req.body.post,
                user: req.user._id
            });

            post.comments.push(comment);
            post.save();
            let user = await User.findById(comment.user);
            console.log(user);
            if(req.xhr)
            {
                return res.status(200).json({
                    data: {
                        comment: comment,
                        userName: user.name

                    },
                    message: 'Comment created'
                })
            }
            res.redirect('/');
        }
    }
    catch(err)
    {
        console.log(`Error ${err}`);
        return;
    }
    
}

module.exports.destroy = async (req,res)=>{
    try{
        let comment = await Comment.findById(req.params.id);
        //comment can be deleted by the owner of the comment
        if(comment.user == req.user.id)
        {
            //storing post if of the comment to be deleted before deleting it
            let postId = comment.post;
            comment.remove();
            // pull will pull out the comment with id from the comments array of the post
            let post = await Post.findByIdAndUpdate(postId,{ $pull: {comments: req.params.id}});
            if(req.xhr)
            {
                return res.status(200).json({
                    data: {
                        comment_id: comment._id
                    },
                    message: 'Comment Deleted'
                });
            }
            return res.redirect('back');

        }
        else
        {
            return res.redirect('back');
        }
    }
    catch(err)
    {
        console.log(`Error ${err}`);
        return;
    }
    
}