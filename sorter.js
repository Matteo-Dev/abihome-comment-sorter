const fs = require("fs");

const OUTPUT_FILE_NAME = "comments";
const OUTPUT_FILE_PATH = "./output/"+OUTPUT_FILE_NAME+".txt";
const BLOCK_COMMENTS = [
    "test test test... räusper",
    "",
    "test"
]

fs.readFile("./input/Kommentare.json", "utf8", (err, file) => {
    if(err){
        console.log(err);
    } else {
        const jsonData = JSON.parse(file);

        // comments object structure:
        // { 
        //      kommentierterSchueler <string>
        //      Kommentar <Array>
        //          {
        //              kommentierenderSchueler <string>: "Anonym"
        //              Text <string>
        //          }
        // }
        const comments = jsonData["Kommentare"];

        writeCommentFile(comments);
        writeCommentFile(comments, true);
    }
});

const writeCommentFile = (comments, spiegelstrich=false) => {
    let convertedComments = sortComments(convertComments(comments, spiegelstrich));

    let filePath = (spiegelstrich) ? OUTPUT_FILE_PATH.replace("comments", "comments-spiegel") : OUTPUT_FILE_PATH;
        
    fs.writeFileSync(filePath, "");
    for(let i=0; i<convertedComments.length; i++) {
        fs.appendFileSync(filePath, "### " + convertedComments[i].name + " ###\n");    

        for(let j=0; j<convertedComments[i].comments.length; j++){
            fs.appendFileSync(filePath, convertedComments[i].comments[j] + "\n");
        }
        
        fs.appendFileSync(filePath, "\n");
    }
}

const convertComments = (comments, spiegelstrich=false) => {
    let convertedComments = [];

    // returns true if text == blocked and false if text != blocked
    const isBlocked = (text) => {
        for(let i=0; i<BLOCK_COMMENTS.length; i++){
            if(text == BLOCK_COMMENTS[i]) return true;
        }
        return false;
    }

    let commentList = [];
    let commentText = "";
    for(let i=0; i<comments.length; i++){
        for(let j=0; j<comments[i]["Kommentar"].length; j++){
            commentText = comments[i]["Kommentar"][j]["Text"];
            if(!isBlocked(commentText)) commentList.push((spiegelstrich) ? "- " + commentText : commentText);
        }

        convertedComments.push({
            name: comments[i]["kommentierterSchueler"],
            comments: commentList,
        });

        commentList = [];
    }

    return convertedComments;
}

// sort comments after (last) names
const sortComments = (comments) => {
    let sortedComments = [];

    let oNames = [], 
        tempMNames = [],
        mNames = [], 
        indexList = [];

    let lastName = "";
    for(let i=0; i<comments.length; i++){
        lastName = (comments[i].name.split(" ").length < 3) ? comments[i].name.split(" ")[1] : comments[i].name.split(" ")[comments[i].name.split(" ").length-1];

        insertClearDuplicate(oNames, lastName, comments[i].name.split(" ")[0]);
    }

    tempMNames = copy(oNames);
    mNames = tempMNames.sort();

    // create list that stores all new (sorted) positions of the elements in oNames in mNames
    for(let i=0; i<oNames.length; i++){
        indexList.push(mNames.indexOf(oNames[i]));
    }

    // ## LINKING ##
    // each element i of comments is set to its new position according to indexList (indexList[0] corresponds to comments[0], indexList[1] corresponds to comments[1], ... that's how the lists are indirectly linked)
    for(let i=0; i<comments.length; i++){
        sortedComments[indexList[i]] = comments[i];
    }

    return sortedComments;
}

// create copy of a list that is unlinked from the initial list
const copy = (list) => {
    let copiedList = [];
    for(let i = 0; i<list.length; i++){
        copiedList.push(list[i]);
    }
    return copiedList;
}

// recursivly check for inserting a possible duplicate (name)
const insertClearDuplicate = (list, element, prefix) => {
    let counter = 0;

    const checkDuplicate = (list, element) => {
        if(list.includes(element)){
            counter++;

            if(counter != 1){
                checkDuplicate(list, element + prefix + counter);
            } else {
                checkDuplicate(list, element + prefix);
            }
        } else {
            list.push(element);
            return;
        }
    }

    checkDuplicate(list, element);
}