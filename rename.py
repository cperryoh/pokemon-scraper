import os
import re

directory = "./cards/jp"  # Current directory, change if needed

for filename in os.listdir(directory):
    if filename.endswith(".png"):
        new_filename = re.sub(" ", "_", filename)
        if new_filename != filename:
            os.rename(
                os.path.join(directory, filename), os.path.join(directory, new_filename)
            )
