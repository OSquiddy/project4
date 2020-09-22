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

    if (document.querySelector('.numLikes') != undefined) {
        document.querySelectorAll('.numLikes').forEach(post => {
            if (post.dataset.numlikes == 0)
                post.style.display = 'none';
            post.onclick = function () { showLikesModal(this) };
        });
    }

    if (document.querySelector('.shareButton') != undefined) {
        document.querySelectorAll('.shareButton').forEach(post => {
            post.onclick = function () { sharePost(this) };
        });
    }
    // if (document.querySelector('#commentButton') != undefined) 
    //     document.querySelectorAll('#commentButton').forEach(button => button.onclick = function() {
    //         const id = this.dataset.id;
    //         document.querySelector(`#commentInput-${id}`).focus();
    //     })
    if (document.querySelectorAll('.numComments') != undefined) {
        document.querySelectorAll('.numComments').forEach(post => post.onclick = function () { showComments(this) });
        document.querySelectorAll('.comment').forEach(post => post.onfocus = function () { showComments(this) });
    }


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
                    <div class="col-1  px-2 px-sm-3">
                        <img src="${commentProfilePic}" id="commentProfilePic" class="postProfilePicSmall" alt="profile-pic">
                    </div>
                    <div class="col-11 pl-4 pl-sm-3 pl-md-1 pl-lg-3 align-self-end">
                        <span style="font-size: 1.05rem;" id="postUser-${post.id}" style="display: inline-block;">
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
                <div class="metaInfoRow d-flex justify-content-between">
                    <div class="numLikes noSelect" data-numLikes="${post.likes}" id="postLikes-${post.id}" data-id="${post.id}" data-item="post" style="display: none" onclick="showLikesModal(this);">${post.likes} likes </div>
                    <div class="numComments noSelect" data-numComments="${post.numComments}" id="postComments-${post.id}" data-postID="${post.id}" data-item="post" style="display: block;">${post.numComments} comments</div>
                </div>
                <div class="row postOptionRow" id="optionRow-${post.id}">
                    <span class="options flex-fill text-center likeButton" id="newLikeButton" data-item="post" data-id="post-${post.id}">
                        <i class="far fa-thumbs-up"></i> Like</span>
                    <span class="options flex-fill text-center" data-id="${post.id}" id="newCommentButton" onclick="focusComment(this);"><i class="far fa-comment"></i>
                        Comment</span>
                    <span class="options flex-fill text-center" data-id="post-${post.id}" id="newShareButton"><i class="fas fa-share"></i> Share</span>
                </div>

                <div class="row">
                        <div class="col-sm-1 col-2 align-self-center justify-content-center inputProfileContainer">
                            <img class="postProfilePicSmall"
                            src="${commentProfilePic}"
                            alt="profile-pic">
                        </div>
                        <div class="col-sm-11 col-10 my-3 pl-0 pl-sm-3 pl-md-1 pl-lg-3">
                            <input class="comment" data-postID="${post.id}" type="text" id="commentInput-${post.id}" placeholder="Write a comment..." >
                        </div>
                    </div>

                <div class="commentsDisplay" id="commentsDisplay-${post.id}">
                    <div class="commentContainer" style="display: none"> </div>
                </div>
            </div> `);

            document.querySelector('#content').value = '';


            document.querySelector('#newLikeButton').onclick = function () { like(this) };
            document.querySelector('#newEditButton').onclick = function () { edit(this) };
            document.querySelector(`#deleteButton-${post.id}`).onclick = function () { deleteItem(this) };
            document.querySelector(`#newShareButton`).onclick = function() { sharePost(this) };
            document.querySelector(`#postComments-${post.id}`).onclick = function () { showComments(this) };
            document.querySelector(`#commentInput-${post.id}`).onfocus = function () { showComments(this) };
            document.querySelector(`#commentInput-${post.id}`).addEventListener('keyup', function (event) {
                if (event.keyCode === 13) {
                    postComment(this);
                }
            });
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
        <div id="editOptionRow" class="d-flex justify-contents-end mb-2"></div>
        `

    let newPostButton = document.createElement('button');
    newPostButton.innerHTML = 'Post';
    newPostButton.className = 'btn btn-primary ml-auto';
    newPostButton.style.display = 'inline-float';
    newPostButton.id = `newPostButton-${id}`;
    document.querySelector(`#editOptionRow`).append(newPostButton);

    let cancelButton = document.createElement('button');
    cancelButton.innerHTML = 'Cancel';
    cancelButton.className = 'btn btn-light border boder-alert ml-1';
    cancelButton.style.display = 'inline-float';
    cancelButton.id = `cancelButton-${id}`;
    document.querySelector(`#editOptionRow`).append(cancelButton);


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
                id: id,
                content: editedContent,
                item: item
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
            if (document.querySelector(`#postLikes-${id}`).style.display === 'none')
                document.querySelector(`#postLikes-${id}`).style.display = 'block';
            numLikes = parseInt(document.querySelector(`#postLikes-${id}`).dataset.numlikes);
            numLikes += 1;
            if (numLikes == 1)
                document.querySelector(`#postLikes-${id}`).innerHTML = `${numLikes} like`;
            else
                document.querySelector(`#postLikes-${id}`).innerHTML = `${numLikes} likes`;
            document.querySelector(`#postLikes-${id}`).dataset.numlikes = numLikes;
        }
        else if (item == 'comment') {
            if (document.querySelector(`#commentLikes-${id}`).style.display === 'none' || document.querySelector(`#commentLikeIcon-${id}`).style.display === 'none') {
                document.querySelector(`#commentLikeIcon-${id}`).style.display = 'block';
                document.querySelector(`#commentLikes-${id}`).style.display = 'block';
            }
            numLikes = parseInt(document.querySelector(`#commentLikes-${id}`).dataset.numlikes);
            numLikes += 1;
            document.querySelector(`#commentLikes-${id}`).innerHTML = `${numLikes}`;
            document.querySelector(`#commentLikes-${id}`).dataset.numlikes = numLikes;
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
            numLikes = parseInt(document.querySelector(`#postLikes-${id}`).dataset.numlikes);
            numLikes--;
            if (numLikes === 0)
                document.querySelector(`#postLikes-${id}`).style.display = 'none';
            else if (numLikes == 1)
                document.querySelector(`#postLikes-${id}`).innerHTML = `${numLikes} like`;
            else
                document.querySelector(`#postLikes-${id}`).innerHTML = `${numLikes} likes`;
            document.querySelector(`#postLikes-${id}`).dataset.numlikes = numLikes;

        }
        else if (item == 'comment') {
            numLikes = parseInt(document.querySelector(`#commentLikes-${id}`).dataset.numlikes);
            numLikes--;
            if (numLikes === 0) {
                document.querySelector(`#commentLikeIcon-${id}`).style.display = 'none';
                document.querySelector(`#commentLikes-${id}`).style.display = 'none';
            }
            document.querySelector(`#commentLikes-${id}`).innerHTML = `${numLikes}`;
            document.querySelector(`#commentLikes-${id}`).dataset.numlikes = numLikes;

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
            let numComments = document.querySelector(`#postComments-${postID}`).dataset.numcomments;
            numComments++;
            document.querySelector(`#postComments-${postID}`).dataset.numcomments = numComments;
            document.querySelector(`#postComments-${postID}`).innerHTML = `${numComments} comments`;
            const commentContainer = document.querySelector(`#commentsDisplay-${postID}`);
            commentContainer.insertAdjacentHTML('afterbegin', `
            <div class="row my-3" id="commentContainer-${comment.id}">
                    <div class="col-sm-1 col-2">
                        <img src="${img}" alt="profile-pic" class="commentProfilePicSmall">
                    </div>
                    <div class="col-sm-11 col-10 pl-0 pl-sm-3 pl-md-1 pl-lg-3">
                        <div class="commentContainer px-3 pt-2">
                            <div class="row">
                                <div class="col align-self-end">
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
                                                data-id="comment-${comment.id}" onclick="edit(this);"><i
                                                    class="far fa-edit"></i>&nbsp;Edit</span>
                                            <span class="deleteButton dropdown-item"
                                                data-id="comment-${comment.id}" data-item="comment"
                                                id="deleteButton-${comment.id}" data-postID="post" data-container="${postID}">&nbsp;<i class="fas fa-times"></i>&nbsp;&nbsp;Delete
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="postContent" id="comment-${comment.id}">${comment.comment}</div>
                                </div>
                            </div>
                        </div>
                        <div class="row commentOptionRow" id="optionRow-${comment.id}">
                            <span class="options-comment likeButton" data-id="comment-${comment.id}" data-item="comment" onclick="like(this);"> Like </span>

                            <i id="commentLikeIcon-${comment.id}" class="far fa-thumbs-up align-self-center mr-1" style="color:#007bff; font-size: 0.775rem; display: none;" ></i>

                            <span class="numLikes noSelect align-self-center pr-2" style="font-size: 0.775rem;" data-numLikes="${comment.likes}" data-id="${comment.id}" data-type="comment" id="commentLikes-${comment.id}" data-item="comment" onclick="showLikesModal(this)"> 
                            </span>

                            <span style="width: 1px; background-color: grey; margin: 7px 0;"></span>

                            <span class="options-comment" data-id="comment-${comment.id}" data-toggle="modal" data-target="#replyModal"><i class="far fa-comment"></i> Reply</span>
                        </div>
                    </div>
            </div>
            `);
            commentBox.value = '';

            document.querySelector(`#deleteButton-${comment.id}`).onclick = function () { deleteItem(this) };
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
                let postID = post.dataset.container;
                if (document.querySelector(`#postComments-${postID}`) != undefined) {
                    let numComments = document.querySelector(`#postComments-${postID}`).dataset.numcomments;
                    numComments--;
                    document.querySelector(`#postComments-${postID}`).dataset.numcomments = numComments;
                    document.querySelector(`#postComments-${postID}`).innerHTML = `${numComments} comments`;
                }
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

/**
 * This handles the About section on a profile page. 
 * If it is empty (equal to ' '), its display is set to none by default
 */
function description() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let description;
    /**
     * The first time a description is entered, the #descriptionText element is created along
     *  with some other elements inside the #description element.
     * If #descriptionText is present, then we want the text present inside this div.
     * 
     * If it does not exist, then it means that the first description is yet to be entered. 
     * In this case, we need the contents of the #description element.
     */
    if (document.querySelector('#descriptionText') != undefined)
        description = document.querySelector('#descriptionText').innerText;
    else
        description = document.querySelector('#description').innerText;
    let id = document.querySelector('#descriptionButton').dataset.id;
    // Show the descriptionContainer.
    document.querySelector(`#descriptionContainer-${id}`).style.display = 'flex';

    // If the description was empty, generate an empty <textarea> called #descriptionText and hide the edit button.
    if (description == "") {
        document.querySelector('#editDescription').style.display = 'none';
        document.querySelector('#description').innerHTML = `<textarea rows="5" style="margin:0 auto 10px; width: 100%; padding: 9px" id="descriptionText"></textarea>
        <div class="d-flex dOptionRow justify-content-end">
            <button class="btn btn-primary mx-1" id="dSubmitButton">Submit</button>
            <button class="btn btn-light border border-alert ml-1" id="dCancelButton">Cancel</button>
        </div>
    `;
    }
    // Otherwise populate the new textarea with existing data
    else {
        document.querySelector('#description').innerHTML = `<textarea rows="5" style="margin:0 auto 10px; width: 100%; padding: 9px" id="descriptionText"  onfocus="var value = this.value.trim(); this.value = null; this.value = value;" autofocus>${description}</textarea>
        <div class="d-flex dOptionRow justify-content-end">
            <button class="btn btn-primary mx-1" id="dSubmitButton">Submit</button>
            <button class="btn btn-light border border-alert ml-1" id="dCancelButton">Cancel</button>
        </div>
        `;
    }


    /**
     * If the <textarea> is empty when you cancel, hide the About section (descriptionContainer).
     * Otherwise overwrite the new innerHTML with the previous description.
     */
    document.querySelector('#dCancelButton').onclick = () => {
        if (description == "")
            document.querySelector(`#descriptionContainer-${id}`).style.display = 'none';
        else
            document.querySelector('#description').innerHTML = description;
    }

    // Asynchronous submission of the description using the Fetch API
    document.querySelector('#dSubmitButton').onclick = () => {
        fetch('/description', {
            method: "POST",
            mode: "same-origin",
            headers: {
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify({
                description: document.querySelector('#descriptionText').value
            })

        })
            .then(response => response.json())
            .then(result => {
                console.log(result);
                /**
                 * The api returns a JSON object containing a message and also includes the description
                 * that was submitted. 
                 * 
                 * If the description was an empty string '' (ie. user deleted all text)
                 * then the displayContainer is hidden, and the 'Add a description' button is shown again
                 * 
                 * Otherwise, if the description was a non-empty string, the text inside the #description element
                 * is substituted with the description. The edit icon on the right side of the container is made 
                 * visible, and the 'Add a description' button is hidden.
                 */
                if (result.description == "") {
                    document.querySelector('#description').innerHTML = result.description;
                    document.querySelector(`#descriptionContainer-${id}`).style.display = 'none';
                    document.querySelector('#descriptionButton').innerText = 'Add a description';
                    if (document.querySelector('#descriptionButton').style.display === 'none') {
                        document.querySelector('#descriptionButton').style.display = 'inline-block';
                        document.querySelector('#descriptionButton2').style.display = 'inline-block';
                    }
                }
                else {
                    document.querySelector('#description').innerHTML = result.description;
                    document.querySelector('#editDescription').style.display = 'flex';
                    document.querySelector('#descriptionButton').style.display = "none";
                    document.querySelector('#descriptionButton2').style.display = 'none';
                }

            })
            .catch(error => console.log(error));
    }
}

function showLikesModal(post) {
    const postID = post.dataset.id;
    const item = post.dataset.item;
    fetch(`/g/likers/${postID}/i=${item}`)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            document.querySelector('#likersModalBody').innerHTML = '';
            modalBody = document.querySelector('#likersModalBody');

            result.likers.forEach(liker => {
                let likerDiv = document.createElement('div');
                likerDiv.className = "liker mb-2";
                likerDiv.innerHTML = `
            <img src="${liker["profilePic"]}" alt="profile-pic" class="modalProfilePic">
            <span><a href="/"> ${liker["username"]} </a></span>
            `;
                modalBody.append(likerDiv);
                $('#postLikesModal').modal('show');
            })
        })
        .catch(error => console.log(error));
}

function showComments(numComments_Button) {
    const id = numComments_Button.dataset.postid;
    if (document.querySelector(`#commentsDisplay-${id}`).style.display === 'block' && numComments_Button.className !== 'comment')
        document.querySelector(`#commentsDisplay-${id}`).style.display = 'none';
    else
        document.querySelector(`#commentsDisplay-${id}`).style.display = 'block';
}

function focusComment(post) {
    const id =  post.dataset.id;
    document.querySelector(`#commentInput-${id}`).focus();
}

function sharePost() {
    $('#sharePostModal').modal('show');
    document.querySelector('#shareModalSubmit').onclick = () => {
        document.querySelector('#shareModalMessage').style.display = 'inline'
    };
}