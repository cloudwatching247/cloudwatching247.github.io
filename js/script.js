// script.js
var backend_url = "https://rtlqdhy3r7kmbxdblsl32pu6ta0oelez.lambda-url.us-west-2.on.aws/";
var APP_VERSION = "0.0.2"

// Function to fetch data from the API
function fetchData(elem) {
  console.log("button clicked");
  console.log("parentID: " + elem.parent().attr("id"));
  console.log("parentParentID: " + elem.parents(".accordion").attr("id"));
  if (elem.parent().attr("id") == "headingIntro" || elem.parent().attr("id") == "headingAbout") {
    console.log("no backend op needed");
    return
  }
  var apiData = {
    "id": "elementId",
    "body": "elementBody"
  }
  console.log("data: " + JSON.stringify(apiData));

  if (elem.parents(".accordion").attr("id") == "accordionMain") {
    categories = loadCategories(elem.parent().attr("id"));
    console.log("categories: " + categories);
    for (let cat of categories) {
      createCategoryAccordionItem(elem, cat);
    }
  } else {
    catItem = loadCategoryItem(elem.parent().attr("id"));
    createCategoryItemText(elem, catItem);
  }
}

function loadCategories(categoryName){
  console.log("loadCategories- categoryName: " + categoryName);
  categories = ["Cat1", "Cat2", "Cat3"];
  return categories;
}

function createCategoryAccordionItem(elem, categoryName){
  console.log("createCategoryAccordionItem - elem: " + elem.parent().attr('id'));
  console.log("createCategoryAccordionItem - categoryName: " + categoryName);
  button = '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse" ' + categoryName + '" aria-expanded="false" aria-controls="collapse' + categoryName + '">' + categoryName + '</button>';
  accordionHeader = '<h2 class="accordion-header" id="heading' + categoryName + '">' + button + '</h2>';
  accordionBody = '<div class="accordion-body"><strong>Loading...</strong></div>';
  accordionCollapse = ' <div id="collapse' + categoryName + '" class="accordion-collapse collapse" aria-labelledby="heading' + categoryName + '" data-bs-parent="#' + elem.parents(".accordion").attr("id") + '">' + accordionBody + '</div>';
  newElem = '<div class="accordion-item">' + accordionHeader + accordionCollapse + '</div>';
    // multi-line string with interpolation to create new accordion header element
//    newElem = """
//              <div class="accordion-item">
//                <h2 class="accordion-header" id="heading">
//                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEdge1" aria-expanded="false" aria-controls="collapseEdge1">
//                    Edge1
//                  </button>
//                </h2>
//                <div id="collapseEdge1" class="accordion-collapse collapse" aria-labelledby="headingEdge1" data-bs-parent="#accordionAviatrix">
//                  <div class="accordion-body">
//                    <strong>Edge1</strong>
//                  </div>
//                </div>
//              </div>
    // multi-line string with interpolation to create new accordion header element
  console.log(JSON.stringify(elem));
  // elem.parents("accordion-item").children("accordion-body").append(newElem);
}

  // console.log($(element).attr("id"))
  // $.ajax({
  //     url: backend_url,
  //     method: "GET",
  //     async: true, // Ensure asynchronous request
  //     headers: {
  //         "authentication": "Authentication" // Add your custom header here
  //     },
  //     success: function(data){
  //         // Once data is received successfully, display it in the body tag
  //         $("#apiResponse").text(data);
  //         // $("body").html(JSON.stringify(data));
  //     },
  //     error: function(){
  //         // Display an error message if request fails
  //         // $("body").html("Failed to fetch data from the API.");
  //         console.log("Failed to fetch data from the API.");
  //     }
  // });


function loadPostsList(elem){
  console.log("loadPostsList - elem blog-data-type: " + elem.attr('blog-data-type'));
  postsList = [
    {"id": "newBlog1", "title": "New Blog1", "blurb": "This is new blog 1", "btnText": "Show more..."},
    {"id": "newBlog2", "title": "New Blog2", "blurb": "This is new blog 2", "btnText": "Show more..."},
    {"id": "newBlog3", "title": "New Blog3", "blurb": "This is new blog 3", "btnText": "Show more..."}
  ]
  for (let post of postsList) {
    newPost = generatePostItem(post);
    console.log(JSON.stringify(newPost));
    $("#" + elem.attr("aria-controls")).children("div.card.card-body").append(newPost);
  }
}

function generatePostItem(post){
  startButtonComment = '<!-- start ' + post['id'] +' collapse button -->';
  postBlurb = '<p>' + post['blurb'] + '</p>'
  postTitle = '<p><a class="btn btn-primary blogpost" blog-data-id="' + post['id'] + '" data-bs-toggle="collapse" href="#' + post['id'] + 'Collapse" role="button" aria-expanded="false" aria-controls="' + post['id'] + 'Collapse">' + post['title'] + '</a></p>'
  endButtonComment = '<!-- end ' + post['id'] +' collapse button -->'
  startBodyComment = '<!-- start ' + post['id'] +' collapse body -->'
  postBody = '<div class="collapse" id="' + post['id'] +'Collapse"><div class="card card-body"><p>Loading...</p></div></div><br>'
  endBodyComment = '<!-- end ' + post['id'] +' collapse body -->'
  post = startButtonComment + '\n' + postBlurb + postTitle + endButtonComment + startBodyComment + postBody + endBodyComment
  return post
}

function loadPostData(elem){
  postText = "newPostText for " + elem.attr("blog-data-id");
  $("#" + elem.attr("aria-controls")).children("div.card.card-body").html(postText);
}

$(document).ready(function(){
  console.log("version: " + APP_VERSION);
  $("#appVersion").text(APP_VERSION);
  // Event listener for the button click
  $("a.btn.btn-primary.mainblog").on("click", function(){
    console.log("mainClass: " + $(this).attr("class"));
    console.log("mainClass: " + $(this).attr("blog-data-type"));
    console.log("mainClass: " + $(this).attr("aria-controls"));
    loadPostsList($(this));
    // fetchData($(this));
  });
  // Event listener for the button click
  $("body").on("click", "a.btn.btn-primary.blogpost", function(){
    console.log("mainClass: " + $(this).attr("class"));
    console.log("mainClass: " + $(this).attr("blog-data-id"));
    console.log("mainClass: " + $(this).attr("aria-controls"));
    loadPostData($(this));
    // fetchData($(this));
  });
  $("button[type|='search']").on("click", function(){
    console.log("mainClass: " + $(this).attr("class"));
  });
});
