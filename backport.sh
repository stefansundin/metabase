git reset HEAD~1
rm ./backport.sh
git cherry-pick 7c25508a763ab8caa3c4dfc38f8a571edaf245c9
echo 'Resolve conflicts and force push this branch'
