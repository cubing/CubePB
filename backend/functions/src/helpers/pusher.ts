import { getPusher } from "../utils/pusher";
import { executeDBQuery } from "../utils/knex";
import type { Request, Response } from "express";

export function handlePusherAuth(req: Request, res: Response): void {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  let presenceData = <any>null;

  if (channel.match(/^presence-/)) {
    if (req.user) {
      presenceData = {
        user_id: req.user.id,
        user_info: {
          name: "Mr Channels",
          twitter_id: "@pusher",
        },
      };
    }
  }

  const auth = getPusher().authenticate(socketId, channel, presenceData);
  res.send(auth);
}

export function handlePusherChannelVacated(req: Request, res: Response): void {
  req.body.events.forEach((event) => {
    if (event.name === "channel_vacated") {
      //delete table rows where channel == channel
      executeDBQuery("DELETE FROM jqlSubscription WHERE channel = :channel", {
        channel: event.channel.replace(/^private-/, ""),
      });
    }
  });

  res.send({});
}
