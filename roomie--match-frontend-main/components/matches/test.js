new Date(timestamp.seconds * 1000).toLocaleDateString()


query(
  collection(db, 'roomie-users', user.uid, 'match-requests'),
  where('status', '==', 'pending')
);
