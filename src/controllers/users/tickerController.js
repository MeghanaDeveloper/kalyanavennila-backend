

// const clickTracking = async (req, res) => {
//     const { url } = req.body;
//     const userId = req.userDetails._id;
//   try {
//     if (!userId) {
//         return res.status(401).json({ message: "This Email address is not registered."  });
//       }

//     if (!url) {
//       return res.status(400).json({ message: "URL is required" });
//     }

//     const existingClick = await clickTrackingModel.findOne({ userId, url });
//     if (existingClick) {
//         existingClick.count += 1;
//         await existingClick.save();
//       } else {
//         await clickTrackingModel.create({ userId, url,count: 1 });
//       }

//     res.status(200).json({ userId,url });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// //
// const getAllClickTracking = async (req, res) => {
//     try {
//       const clicks = await clickTrackingModel.find()
//         .populate("userId", "accountId firstName email")
//         .sort({ updatedAt: -1 })
//         .lean();
  
//       const grouped = {};
  
//       clicks.forEach(click => {
//         const user = click.userId;
//         if (!user || !user._id) return;
  
//         const userId = user._id.toString();
  
//         if (!grouped[userId]) {
//           grouped[userId] = {
//             userId: userId,
//             email: user.email || "",
//             firstName: user.firstName || "",
//             accountId: user.accountId || "",
//             clicks: []
//           };
//         }
  
//         grouped[userId].clicks.push({
//           url: click.url,
//           count: click.count,
//           createdAt: click.createdAt,
//           updatedAt: click.updatedAt,
//         });
//       });
  
//       const result = Object.values(grouped);
  
//       res.status(200).json(result);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  
const { clickTrackingModel } = require("../../models/clickTrackingSchema");

const clickTracking = async (req, res) => {
  const { url } = req.body;
  const userId = req.userDetails._id;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user." });
    }

    if (!url) {
      return res.status(400).json({ message: "URL is required." });
    }

    let userClick = await clickTrackingModel.findOne({ userId });

    if (!userClick) {
      // Create new entry for user
      userClick = await clickTrackingModel.create({
        userId,
        clicks: [{ url, count: 1 }],
        traversal: [{ url }]
      });
    } else {
      // Handle clicks[] (ticker-style)
      const existingClick = userClick.clicks.find(item => item.url === url);
      if (existingClick) {
        existingClick.count += 1;
      } else {
        userClick.clicks.push({ url, count: 1 });
      }

      // Handle traversal[] (log every visit)
      userClick.traversal.push({ url });

      await userClick.save();
    }

    res.status(200).json({ message: "Click and traversal recorded", url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllClickTracking = async (req, res) => {
  try {
    const data = await clickTrackingModel.find()
      .populate("userId", "accountId firstName email")
      .sort({ updatedAt: -1 })
      .lean();

    const result = data.map(entry => ({
      userId: entry.userId?._id || null,
      email: entry.userId?.email || "",
      firstName: entry.userId?.firstName || "",
      accountId: entry.userId?.accountId || "",
      clicks: entry.clicks,
      traversal: entry.traversal
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  clickTracking,
  getAllClickTracking,
};
