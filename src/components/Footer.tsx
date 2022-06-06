import React from "react";
import FooterLogo from "img/logos/FooterLogo.svg";
import Discord from "img/logos/discord.png";
import Twitter from "img/logos/twitter.png";
import Telegram from "img/logos/telegram.png";
import Github from "img/logos/github.png";
import {Link} from "react-router-dom";

export function Footer() {

    return (
        <footer className="footer py-5">
            <div className="container">
                <div className="row no-gutters">
                    <div className="col-6 pb-5">
                         <img src={FooterLogo} alt="Mundis Blockchain Explorer" />
                    </div>
                    <div className="col-6 d-flex">
                      <ul className="ml-auto">
                      <li>Find us on:</li>
                        <li>
                             <Link
                                  to={{ pathname: "https://discord.com/invite/8G2xEFJ5h7" }}
                                  target='_blank'
                                  aria-label='Discord'
                                  >
                                    <img src={Discord} alt="Mundis Blockchain Explorer: Discord" />
                            </Link>
                        </li>
                        <li>
                             <Link
                                  to={{ pathname: "https://t.me/mundisnetwork" }}
                                  target='_blank'
                                  aria-label='Telegram'
                                  >
                                <img src={Telegram} alt="Mundis Blockchain Explorer: Telegram" />
                            </Link>
                        </li>
                        <li>
                            <Link
                              to={{ pathname: "https://twitter.com/MundisNetwork" }}
                              target='_blank'
                              aria-label='Twitter'
                              >
                                <img src={Twitter} alt="Mundis Blockchain Explorer: Twitter" />
                            </Link>
                        </li>
                          <li>
                              <Link
                                  to={{ pathname: "https://github.com/mundisnetwork/blockchain-explorer" }}
                                  target='_blank'
                                  aria-label='Github'
                              >
                                  <img src={Github} alt="Mundis Blockchain Explorer: Github" />
                              </Link>
                          </li>
                      </ul>
                    </div>
                    <div className="col-6 border-top pt-4">
                       <p>Copyright (c) 2022 Metaverse Labs. All rights reserved.</p>
                    </div>
                    <div className="col-6 border-top pt-4">
                        <p className="text-right">maintainers@mundis.io</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
