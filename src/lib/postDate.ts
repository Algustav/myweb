type BlogPost = {
  id: string;
  data: {
    pubDate?: Date;
  };
};

export function getPostDate(post: BlogPost) {
  if (post.data.pubDate instanceof Date && !Number.isNaN(post.data.pubDate.valueOf())) {
    return post.data.pubDate;
  }

  const compactTimestamp = post.id.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
  if (compactTimestamp) {
    return new Date(
      `${compactTimestamp[1]}-${compactTimestamp[2]}-${compactTimestamp[3]}T${compactTimestamp[4]}:${compactTimestamp[5]}:${compactTimestamp[6]}`
    );
  }

  const compactDate = post.id.match(/^(\d{4})(\d{2})(\d{2})/);
  if (compactDate) {
    return new Date(`${compactDate[1]}-${compactDate[2]}-${compactDate[3]}T00:00:00`);
  }

  const dashedDate = post.id.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dashedDate) {
    return new Date(`${dashedDate[1]}-${dashedDate[2]}-${dashedDate[3]}T00:00:00`);
  }

  return new Date(0);
}
