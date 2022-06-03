import React from "react";
import FooterLogo from "img/logos/FooterLogo.svg";
import Discord from "img/logos/discord.png";
import Twitter from "img/logos/twitter.png";
import Medium from "img/logos/medium.png";
import { clusterPath } from "utils/url";
import { Link, NavLink } from "react-router-dom";
import { ClusterStatusButton } from "components/ClusterStatusButton";



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
                                  to={{ pathname: "https://blog.mundis.io/" }}
                                  target='_blank'
                                  aria-label='Medium'
                                  >
                                <img src={Medium} alt="Mundis Blockchain Explorer: Medium" />
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
                      </ul>
                    </div>
                    <div className="col-6 border-top pt-4">
                       <p>Copyright (c) 2022 Mundis Foundation. All rights reserved.</p>
                    </div>
                    <div className="col-6 border-top pt-4">
                        <p className="text-right">info@mundis.io</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
