export const getTheAvgScore = (conversation: any) => {
    let avgScore;
    conversation.reduct(conversation.score)
    avgScore = conversation.score / conversation.length
    return avgScore
    
}