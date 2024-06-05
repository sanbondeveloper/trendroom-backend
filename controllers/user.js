exports.readInterests = (req, res) => {
  const user = req.user;

  return res.status(200).json({ interests: user?.interests || [] });
};
