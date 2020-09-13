document.addEventListener('DOMContentLoaded', () => {
    console.log("Script has been loaded.");

    if (document.querySelector('#contentForm') != undefined)
        document.querySelector('#contentForm').onsubmit = () => submitPost();
    if (document.querySelector('#followButton') != undefined)
        document.querySelector('#followButton').addEventListener('click', () => follow());
    if (document.querySelector('.editButton') != undefined)
        document.querySelectorAll('.editButton').forEach(post => post.onclick = function () { edit(this) });
    if (document.querySelector('.likeButton') != undefined)
        document.querySelectorAll('.likeButton').forEach(post => post.onclick = function () { like(this) });
    if (document.querySelector('.comment') != undefined)
        document.querySelectorAll('.comment').forEach(commentInput => commentInput.addEventListener("keyup", function (event) {
            if (event.keyCode === 13) {
                postComment(this);
            }
        }));
    if (document.querySelectorAll('.deleteButton') != undefined)
        document.querySelectorAll('.deleteButton').forEach(post => post.onclick = function () { deleteItem(this) });
    if (document.querySelector('#deleteProfilePic') != undefined)
        document.querySelector('#deleteProfilePic').onclick = function () { deleteProfilePic() };
    if (document.querySelector('#descriptionButton') != undefined)
        document.querySelector('#descriptionButton').onclick = () => { description() };
        if (document.querySelector('#editDescription') != undefined)
        document.querySelector('#editDescription').onclick = () => { description() };
    
})

function submitPost() {
    // CSRF Token
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch("/", {
        method: 'POST',
        mode: "same-origin",
        headers: {
            "X-CSRFToken": csrftoken,
            "Accept": "network/json",
            "Content-Type": "network/json",
        },
        body: JSON.stringify({
            content: document.querySelector('#content').value
        })
    })
        .then(response => response.json())
        .then(result => {

            //Print the result
            console.log(result)
            let post = result.posts[0]
            let commentProfilePic = post.user.profilePic
            let userProfileLink = document.querySelector('.userProfileLink').href
            //try using django templating system in javascript
            document.querySelector('#postsDisplay').insertAdjacentHTML('afterbegin', `
            <div class="d-flex border border-alert py-3 my-3 postContainer" id="postContainer-${post.id}">
                <div class="col">
                    <div class="row">
                    <div class="col-1">
                        <img src="${commentProfilePic}" id="commentProfilePic" alt="profile-pic"
                            style="object-fit: cover; width: 1.825rem; height: 1.825rem; border-radius: 50%;">
                    </div>
                    <div class="col-11 pl-0 align-self-end">
                        <span style="font-size: 1.05rem;" id="postUser" style="display: inline-block;">
                            <a href="${userProfileLink}">
                            ${post.user.username.charAt(0).toUpperCase() + post.user.username.slice(1)}
                            </a>
                        </span>
                        <div class="dropdown d-inline-flex" style=" float:right">
                            <button class="btn" type="button" id="dropdownMenuButton"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-right"
                                aria-labelledby="dropdownMenuButton">
                                <span class="editButton dropdown-item" data-item="post" data-id="post-${post.id}" id="newEditButton"><i class="far fa-edit"></i>&nbsp;Edit
                                </span>
                                <span class="deleteButton dropdown-item" data-id="post-${post.id}" data-item="post" id="deleteButton-${post.id}" data-postID="post">&nbsp;<i class="fas fa-times"></i>&nbsp;&nbsp;Delete
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="postContent" id="post-${post.id}">${post.content}</div>
                    </div>
                </div>
                <div class="numLikes" data-numLikes="${post.likes}" id="numLikes-${post.id}">${post.likes} likes </div>
                <div class="row optionRow" id="optionRow-${post.id}">
                    <span class="options likeButton ml-3" id="newLikeButton" data-item="post" data-id="post-${post.id}">
                        <i class="far fa-thumbs-up"></i> Like</span>
                    <span class="options" data-id="post-${post.id}" id="newCommentButton"><i class="far fa-comment"></i>
                        Comment</span>
                    <span class="options" data-id="post-${post.id}"><i class="fas fa-share"></i> Share</span>
                    <span class="options editButton" data-item="post" data-id="post-${post.id}" id="newEditButton2"><i class="far fa-edit"></i>
                        Edit</span>
                </div>
                <div class="row">
                        <div class="col my-3">
                            <input class="comment" data-postID="${post.id}" type="text"
                                placeholder="Write a comment..."
                                style="width: 100%; padding: 7px 15px; border-radius: 50px; border: 1px solid lightgrey" id="newCommentBox">
                        </div>
                    </div>
                </div>
            </div> `);

            document.querySelector('#content').value = '';


            document.querySelector('#newLikeButton').onclick = function () { like(this) };
            document.querySelector('#newEditButton').onclick = function () { edit(this) };
            document.querySelector('#newEditButton2').onclick = function () { edit(this) };
            document.querySelector(`#deleteButton-${post.id}`).onclick = function() { deleteItem(this) };
            document.querySelector('#newCommentBox').addEventListener('keyup', function (event) {
                if (event.keyCode === 13) {
                    postComment(this);
                }
            })
        })
        .catch(error => console.log(error));



    return false;
}

function follow() {
    console.log("Button has been clicked");
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const username = document.querySelector('#profileUsername').innerHTML;
    let buttonValue = document.querySelector('#followButton').innerHTML;
    fetch(`/follow/${username}`, {
        method: 'POST',
        mode: "same-origin",
        headers: {
            "X-CSRFToken": csrftoken,
        },
        body: JSON.stringify({
            buttonValue: `${buttonValue}`
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if (result.error) {
                alert(`${result.error}`);
            }
            if (result.message === 'Followed successfully') {
                if (buttonValue === 'Follow') {
                    document.querySelector('#followButton').innerHTML = 'Unfollow';
                    let followerCount = document.querySelector('#followerCount').innerHTML;
                    followerCount++;
                    document.querySelector('#followerCount').innerHTML = followerCount;
                    let newFollower = document.createElement('div');
                    const user = result.user;
                    if (followerCount > 0 && document.querySelector('#numFollowers') != undefined)
                        document.querySelector('#numFollowers').style.display = 'none';
                    const img = document.querySelector('img').src;
                    newFollower.innerHTML = `
                    <div class="follower" id="follower-${user.id}">
                    <img src="${user.profilePic}" alt="profile-pic" class="modalProfilePic">
                    <span><a href="/${user.username}"> ${user.username} </a></span>
                    </div>
                    `;
                    document.querySelector('#followersModalBody').append(newFollower);
                }
            }
            else if (result.message === 'Unfollowed successfully') {
                if (buttonValue === 'Unfollow') {
                    document.querySelector('#followButton').innerHTML = 'Follow';
                    let followerCount = document.querySelector('#followerCount').innerHTML;
                    followerCount--;
                    document.querySelector('#followerCount').innerHTML = followerCount;
                    const user = result.user;
                    document.querySelector(`#follower-${user.id}`).remove();
                    if (followerCount == 0)
                        document.querySelector('#numFollowers').style.display = 'block';
                }
            }
        })
        .catch(error => console.log(error))
}

function edit(post) {
    const content = document.querySelector(`#${post.dataset.id}`).innerHTML;
    const item = post.dataset.item;
    let id = 0;
    if (item == 'post') {
        id = post.dataset.id.substring(5);
    }
    else if (item == 'comment') {
        id = post.dataset.id.substring(8);
    }
    console.log(content);
    document.querySelector(`#${post.dataset.id}`).parentElement.innerHTML = `
        <textarea id="edit-${post.dataset.id}" style="width:100%; margin: 10px 0; padding: 5px" rows="2" onfocus="var value = this.value.trim(); this.value = null; this.value = value;" autofocus>${content}</textarea>
        `

    let newPostButton = document.createElement('button');
    newPostButton.innerHTML = 'Post';
    newPostButton.className = 'btn btn-primary ml-auto';
    newPostButton.style.display = 'inline-float';
    newPostButton.id = `newPostButton-${id}`;
    document.querySelector(`#optionRow-${id}`).append(newPostButton);

    let cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    cancelButton.className = 'btn btn-light border boder-alert ml-1 mr-3';
    cancelButton.style.display = 'inline-float';
    cancelButton.id = `cancelButton-${id}`;
    document.querySelector(`#optionRow-${id}`).append(cancelButton);


    newPostButton.onclick = () => {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const editedContent = document.querySelector(`#edit-${post.dataset.id}`).value;
        console.log("Button has been clicked")
        fetch("/edit", {
            method: 'POST',
            mode: "same-origin",
            headers: {
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
                id: post.dataset.id.substring(5),
                content: editedContent
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                document.querySelector(`#edit-${post.dataset.id}`).parentElement.innerHTML = `
                <div class="postContent" id="${post.dataset.id}">${editedContent}</div>
                `;
                cancelButton.remove();
                newPostButton.remove();
            })
            .catch(error => console.log(error));
    }

    cancelButton.onclick = () => {
        document.querySelector(`#edit-${post.dataset.id}`).parentElement.innerHTML = `
            <div class="postContent" id="${post.dataset.id}">${content}</div> 
            `
        cancelButton.remove();
        newPostButton.remove();
    }

}

function like(post) {
    const item = post.dataset.item;
    let id = 0;
    if (item == 'post') {
        id = post.dataset.id.substring(5);
    }
    else if (item == 'comment') {
        id = post.dataset.id.substring(8);
    }
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let numLikes = 0;
    if (post.style.color !== 'rgb(0, 123, 255)') {
        // console.log(`Post No. ${id} has been liked.`);
        post.style.color = 'rgb(0, 123, 255)';
        if (item == 'post') {
            numLikes = parseInt(document.querySelector(`#numLikes-${id}`).dataset.numlikes);
            numLikes += 1;
            document.querySelector(`#numLikes-${id}`).innerHTML = `${numLikes} likes`;
            document.querySelector(`#numLikes-${id}`).dataset.numlikes = numLikes;
        }
        else if (item == 'comment') {
            numLikes = parseInt(document.querySelector(`#commentNumLikes-${id}`).dataset.numlikes);
            numLikes += 1;
            document.querySelector(`#commentNumLikes-${id}`).innerHTML = `${numLikes} likes`;
            document.querySelector(`#commentNumLikes-${id}`).dataset.numlikes = numLikes;
        }

        //Send the user profile to be added to the post's likes
        fetch(`/like/${id}`, {
            method: 'POST',
            mode: 'same-origin',
            headers: {
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
                status: "Like",
                item: item
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
            .catch(error => console.log(error));
    }
    else {
        // console.log(`Post No. ${id} has been unliked.`);
        post.style.color = 'rgb(33, 37, 41)';
        if (item == 'post') {
            numLikes = parseInt(document.querySelector(`#numLikes-${id}`).dataset.numlikes);
            numLikes--;
            document.querySelector(`#numLikes-${id}`).innerHTML = `${numLikes} likes`;
            document.querySelector(`#numLikes-${id}`).dataset.numlikes = numLikes;
        }
        else if (item == 'comment') {
            numLikes = parseInt(document.querySelector(`#commentNumLikes-${id}`).dataset.numlikes);
            numLikes--;
            document.querySelector(`#commentNumLikes-${id}`).innerHTML = `${numLikes} likes`;
            document.querySelector(`#commentNumLikes-${id}`).dataset.numlikes = numLikes;
        }

        //Send the user profile to be removed from the post's likes
        fetch(`/like/${id}`, {
            method: 'POST',
            mode: 'same-origin',
            headers: {
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
                status: "Unlike",
                item: item
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
            .catch(error => console.log(error));
    }
}

function postComment(commentBox) {
    let comment = commentBox.value;
    const postID = commentBox.dataset.postid;
    //Create comment using the API
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch(`/comment/${postID}`, {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            "X-CSRFToken": csrftoken
        },
        body: JSON.stringify({
            content: comment
        })
    })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            console.log("Comment posted");
            const user = document.querySelector('#username').innerHTML;
            const img = result.comment.user.profilePic;
            let comment = result.comment;
            const commentContainer = document.querySelector(`#commentsDisplay-${postID}`);
            commentContainer.insertAdjacentHTML('beforeend', `
            <div class="d-flex py-3 my-3 mx-3 commentContainer" id="commentContainer-${comment.id}">
                            <div class="col">
                                <div class="row">
                                    <div class="col-1">
                                        <img src="${img}" alt="profile-pic"
                                            style="object-fit: cover; width: 1.5rem; height: 1.5rem; border-radius: 50%;"
                                            class="commentProfilePic">
                                    </div>
                                    <div class="col-11 px-0 align-self-end ml-n2">
                                        <span style="font-size: 1.05rem;" id="postUser" style="display: inline-block;">
                                            <a href="/${user}"
                                                class="userProfileLink">${user.charAt(0).toUpperCase() + user.slice(1)}</a>
                                        </span>
                                        <div class="dropdown d-inline-flex" style=" float:right">
                                                <button class="btn" type="button" id="dropdownMenuButton"
                                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    <i class="fas fa-ellipsis-h"></i>
                                                </button>
                                                <div class="dropdown-menu dropdown-menu-right"
                                                    aria-labelledby="dropdownMenuButton">
                                                    <span class="editButton dropdown-item" data-item="comment"
                                                        data-id="comment-${comment.id}" id="newEditButton"><i
                                                            class="far fa-edit"></i>&nbsp;Edit</span>
                                                    <span class="deleteButton dropdown-item"
                                                        data-id="comment-${comment.id}" data-item="comment"
                                                        id="deleteButton-${comment.id}" data-postID="post">&nbsp;<i
                                                            class="fas fa-times"></i>&nbsp;&nbsp;Delete</span>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="postContent" id="comment-${comment.id}">${comment.comment}</div>
                                    </div>
                                </div>
                                <div class="numLikes" data-numLikes="${comment.likes}" data-id="numLikes-${comment.id}" data-toggle="modal"
                                data-target="#postLikesModal" id="commentNumLikes-${comment.id}">${comment.likes}
                                    likes</div>
                                <div class="row optionRow" id="optionRow-${comment.id}">
                                    <span class="options likeButton ml-3" data-id="comment-${comment.id}" data-item="comment" id="newCommentLikeButton">
                                        <i class="far fa-thumbs-up"></i> Like</span>
                                    <span class="options" data-id="comment-${comment.id}"><i class="far fa-comment"></i>
                                        Comment</span>
                                    <span class="options editButton" data-id="comment-${comment.id}" id="newEditButton2" data-item="comment"><i
                                            class="far fa-edit"></i> Edit</span>
                                </div>
                            </div>
                        </div>
            `);
            commentBox.value = '';
            document.querySelector('#newCommentLikeButton').onclick = function () { like(this) };
            document.querySelector('#newEditButton').onclick = function () { edit(this) };
            document.querySelector('#newEditButton2').onclick = function () { edit(this) };
            document.querySelector(`#deleteButton-${comment.id}`).onclick = function() { deleteItem(this) };
        })
        .catch(error => console.log(error))
}

function deleteItem(post) {

    let id = 0;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    if (post.dataset.item == 'post') {
        id = post.dataset.id.substring(5);
    }
    else if (post.dataset.item == 'comment') {
        id = post.dataset.id.substring(8);
    }
    console.log(`Delete button no. ${id} has been clicked`);
    $('#delConfirmModal').modal('show');

    document.querySelector(`#confirmDelete`).onclick = () => {
        fetch(`/delete/${id}`, {
            method: 'POST',
            mode: 'same-origin',
            headers: {
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
                item: post.dataset.item,
                confirmation: 'YES',
            })
        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
            })
            .catch(error => console.log(error));
        document.querySelector(`#${post.dataset.item}Container-${id}`).remove();
    }
}

function deleteProfilePic() {
    
    fetch(`/delpic`)
    .then(response => response.json())
    .then(result => {
        console.log(result);
        document.querySelector('#profilePic').src = "/static/network/images/defaultAvatar.png";
    })
    .catch(error => console.log(error));
}

function description() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let description = document.querySelector('#description').innerHTML;
    let id = document.querySelector('#descriptionButton').dataset.id;
    document.querySelector(`#descriptionContainer-${id}`).style.display = 'flex';

    if (description == "") {
        document.querySelector('#description').innerHTML = `<textarea rows="5" style="margin:0 auto 10px; width: 100%; padding: 9px" id="descriptionText"></textarea>
        <div class="d-flex dOptionRow justify-content-end">
            <button class="btn btn-primary mx-1" id="dSubmitButton">Submit</button>
            <button class="btn btn-light border border-alert ml-1" id="dCancelButton">Cancel</button>
        </div>
    `;
    }
    else {
        document.querySelector('#description').innerHTML = `<textarea rows="5" style="margin:0 auto 10px; width: 100%; padding: 9px" id="descriptionText"  onfocus="var value = this.value.trim(); this.value = null; this.value = value;" autofocus>${description}</textarea>
        <div class="d-flex dOptionRow justify-content-end">
            <button class="btn btn-primary mx-1" id="dSubmitButton">Submit</button>
            <button class="btn btn-light border border-alert ml-1" id="dCancelButton">Cancel</button>
        </div>
        `;
    }
    
    

    document.querySelector('#dCancelButton').onclick = () => {
        if (description == "")
            document.querySelector(`#descriptionContainer-${id}`).style.display = 'none';
        else 
            document.querySelector('#description').innerHTML = description;
    }

    document.querySelector('#dSubmitButton').onclick = () => {
        fetch('/description', {
            method: "POST",
            mode: "same-origin",
            headers: {
                "X-CSRFToken" : csrftoken
            },
            body: JSON.stringify({
                description: document.querySelector('#descriptionText').value
            })

        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            if(result.description == "") {
                document.querySelector(`#descriptionContainer-${id}`).style.display = 'none';
                document.querySelector('#descriptionButton').innerText = 'Add a description';
            }
            else {
                document.querySelector('#description').innerHTML = result.description;
                document.querySelector('#editDescription').style.display = 'flex';
                document.querySelector('#descriptionButton').style.display = "none";
            }
            
        })
        .catch(error => console.log(error));
    }
}